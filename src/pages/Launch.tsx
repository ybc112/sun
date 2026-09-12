import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ZeroAddress, id as keccakId, parseUnits } from "ethers";
import { useWallet } from "../wallet";
import { useToast } from "../components/Toast";
import { BananaLogo } from "../components/BananaArt";
import { readFactory, switchToChain } from "../lib/chain";
import { CONCEPTS } from "../lib/concepts";
import { deployMintLaunch, type DeployResult } from "../lib/vanity";
import { uploadAsset } from "../lib/api";
import type { LaunchParams } from "../types";
import { config, EXPLORER_BASE } from "../config";
import { parseBNB } from "../lib/format";

const STEPS = [
  { n: "01", t: "代币与概念" },
  { n: "02", t: "融资机制" },
  { n: "03", t: "税费与分红" },
  { n: "04", t: "确认与部署" },
];
const BPS_MAX = 2500;
const SPLIT_MAX = 10000;

const AVATAR_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/gif", "image/webp"];
const AVATAR_MAX_BYTES = 1024 * 1024;
const AVATAR_SIZE = 256;

interface FormState {
  name: string;
  symbol: string;
  conceptKey: string;
  description: string;
  avatar: string;
  telegram: string;
  xLink: string;
  website: string;
  totalSupply: string;
  mintCount: string;
  mintPrice: string;
  maxMintPerWallet: string;
  whitelistEnabled: boolean;
  whitelistMintCount: string;
  claimWaitHours: string;
  buyTaxBps: number;
  sellTaxBps: number;
  transferTaxBps: number;
  addLiquidityTaxBps: number;
  removeLiquidityTaxBps: number;
  launchProtectionTaxBps: number;
  launchProtectionBlocks: string;
  fundFeeBps: number;
  lpFeeBps: number;
  dividendFeeBps: number;
  burnFeeBps: number;
}

const INITIAL: FormState = {
  name: "",
  symbol: "",
  conceptKey: "meme-party",
  description: "",
  avatar: "",
  telegram: "",
  xLink: "",
  website: "",
  totalSupply: "10000000",
  mintCount: "200000",
  mintPrice: "0.00001",
  maxMintPerWallet: "0",
  whitelistEnabled: false,
  whitelistMintCount: "50000",
  claimWaitHours: "6",
  buyTaxBps: 0,
  sellTaxBps: 0,
  transferTaxBps: 0,
  addLiquidityTaxBps: 0,
  removeLiquidityTaxBps: 0,
  launchProtectionTaxBps: 0,
  launchProtectionBlocks: "0",
  fundFeeBps: 0,
  lpFeeBps: 0,
  dividendFeeBps: 0,
  burnFeeBps: 0,
};

/** Canvas 压缩头像到 256×256 JPEG（对齐 KimiMint） */
function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > AVATAR_MAX_BYTES) {
      reject(new Error("图片建议小于 1MB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas 不可用"));
          return;
        }
        ctx.drawImage(img, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("图片读取失败"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

/** 构建链上 metadata JSON（description/avatar/website/telegram/x，与 KimiMint 一致） */
async function buildMetadata(form: FormState): Promise<string> {
  const meta: Record<string, string> = {
    description: form.description.trim().slice(0, 480),
    website: form.website.trim().slice(0, 480),
    telegram: form.telegram.trim().slice(0, 480),
    x: form.xLink.trim().slice(0, 480),
  };
  let avatarUrl = "";
  if (form.avatar) {
    if (form.avatar.startsWith("data:")) {
      try {
        const asset = await uploadAsset(form.avatar);
        avatarUrl = asset.url;
      } catch {
        /* 上传失败则头像为空 */
      }
    } else {
      avatarUrl = form.avatar;
    }
  }
  meta.avatar = avatarUrl;
  const json = JSON.stringify(meta);
  // 链上 metadataUri 上限 4096 字节：超限则裁头像与简介
  if (new TextEncoder().encode(json).length > 4096) {
    meta.avatar = "";
    meta.description = form.description.trim().slice(0, 180);
    return JSON.stringify(meta);
  }
  return json;
}

function Range({
  label,
  value,
  onChange,
  max = BPS_MAX,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="range">
      <span>{label}</span>
      <input type="range" min={0} max={max} step={25} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="v">{(value / 100).toFixed(2)}%</span>
    </div>
  );
}

export default function Launch() {
  const { account, signer, connect, chainId } = useWallet();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [suffix, setSuffix] = useState(config.vanitySuffix);
  const [creationFee, setCreationFee] = useState("0.005");
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<DeployResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [feeInfo, setFeeInfo] = useState<{ feeRecipient: string; tokenDeployer: string } | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    void (async () => {
      try {
        const f = readFactory();
        const [sufRaw, fee, recipient, deployer] = await Promise.all([
          f.requiredTokenSuffix(),
          f.creationFee(),
          f.feeRecipient(),
          f.tokenDeployer(),
        ]);
        if (Number(sufRaw) > 0) setSuffix(Number(sufRaw).toString(16).padStart(4, "0"));
        if (fee) setCreationFee(String(Number(fee) / 1e18));
        setFeeInfo({ feeRecipient: String(recipient), tokenDeployer: String(deployer) });
      } catch {
        /* RPC 未通 */
      }
    })();
  }, []);

  const templateId = useMemo(
    () => keccakId(CONCEPTS.find((c) => c.key === form.conceptKey)?.key ?? "meme-party"),
    [form.conceptKey],
  );

  const splitTotal = form.fundFeeBps + form.lpFeeBps + form.dividendFeeBps + form.burnFeeBps;
  const totalSupplyNum = Number(form.totalSupply) || 0;
  const saleSupply = Math.floor((totalSupplyNum * 5000) / 10000);
  const perMint = form.mintCount ? Math.floor(saleSupply / (Number(form.mintCount) || 1)) : 0;

  const validate = (s: number): string | null => {
    if (s === 0) {
      if (!form.name.trim()) return "请填写代币名称";
      if (!/^[A-Za-z0-9]{2,12}$/.test(form.symbol.trim())) return "代币符号需为 2-12 位字母数字";
      if (!(totalSupplyNum > 0) || !Number.isInteger(totalSupplyNum)) return "总供应量需为正整数";
      if (!(Number(form.mintCount) > 0) || !Number.isInteger(Number(form.mintCount))) return "可铸造数量需为正整数";
      if (Number(form.mintCount) > totalSupplyNum) return "可铸造数量不能超过总供应量";
    }
    if (s === 1) {
      if (!(parseFloat(form.mintPrice) > 0)) return "铸造价格必须大于 0";
      if (perMint < 1) return "可铸造数量过大，每个 Mint 分不到 1 枚代币";
      if (form.whitelistEnabled && Number(form.whitelistMintCount) > Number(form.mintCount))
        return "白名单供应量不能超过可铸造数量";
      const wait = Number(form.claimWaitHours);
      if (form.claimWaitHours !== "" && (!Number.isFinite(wait) || wait < 0 || wait > 24)) return "退款等待需在 0-24 小时";
    }
    if (s === 2) {
      if (form.buyTaxBps > BPS_MAX || form.sellTaxBps > BPS_MAX || form.transferTaxBps > BPS_MAX) return "买卖/转账税最高 25%";
      if (form.addLiquidityTaxBps > BPS_MAX || form.removeLiquidityTaxBps > BPS_MAX) return "LP 税最高 25%";
      if (form.launchProtectionTaxBps > BPS_MAX) return "发射保护税最高 25%";
      if (splitTotal > SPLIT_MAX) return "税收分配总和不能超过 100%";
    }
    return null;
  };

  const goto = (target: number) => {
    const err = validate(step);
    if (err) {
      toast(err, "err");
      return;
    }
    setStep(target);
  };

  const handleAvatar = async (file: File) => {
    if (!AVATAR_TYPES.includes(file.type)) {
      toast("请上传 PNG、JPEG、SVG、GIF 或 WebP 图片", "err");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await compressAvatar(file);
      set("avatar", dataUrl);
    } catch (e) {
      toast(e instanceof Error ? e.message : "图片处理失败", "err");
    } finally {
      setUploading(false);
    }
  };

  const handleDeploy = async () => {
    if (!signer || !account) {
      toast("请先连接钱包", "err");
      return;
    }
    if (chainId !== config.chainId) {
      toast(`请切换到 ${config.nativeSymbol} 主网（Chain ${config.chainId}）`, "err");
      return;
    }
    const err = validate(2);
    if (err) {
      toast(err, "err");
      return;
    }
    setDeploying(true);
    try {
      await switchToChain(signer.provider as never);
      const metadataUri = await buildMetadata(form);
      const params: LaunchParams = {
        name: form.name.trim(),
        symbol: form.symbol.trim().toUpperCase(),
        metadataUri,
        totalSupply: BigInt(totalSupplyNum),
        mintCount: BigInt(Number(form.mintCount)),
        mintPrice: parseBNB(form.mintPrice),
        maxMintPerWallet: BigInt(Number(form.maxMintPerWallet) || 0),
        paymentToken: ZeroAddress,
        rewardToken: ZeroAddress,
        rewardThreshold: BigInt(0),
        receiver: account,
        templateId,
        buyTaxBps: form.buyTaxBps,
        sellTaxBps: form.sellTaxBps,
        transferTaxBps: form.transferTaxBps,
        addLiquidityTaxBps: form.addLiquidityTaxBps,
        removeLiquidityTaxBps: form.removeLiquidityTaxBps,
        launchProtectionTaxBps: form.launchProtectionTaxBps,
        launchProtectionBlocks: Number(form.launchProtectionBlocks) || 0,
        claimWait: Math.round((Number(form.claimWaitHours) || 0) * 3600),
        fundFeeBps: form.fundFeeBps,
        lpFeeBps: form.lpFeeBps,
        dividendFeeBps: form.dividendFeeBps,
        burnFeeBps: form.burnFeeBps,
        whitelistMintCount: form.whitelistEnabled ? BigInt(Number(form.whitelistMintCount) || 0) : BigInt(0),
        whitelistEnabled: form.whitelistEnabled,
      };
      const deployed = await deployMintLaunch(signer, params, suffix, parseUnits(creationFee, 18));
      setResult(deployed);
      toast("发射成功，已自动排队开源验证", "ok");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "部署失败";
      if (/user rejected|denied/i.test(msg)) toast("已取消签名", "info");
      else toast(msg, "err");
    } finally {
      setDeploying(false);
    }
  };

  // ===== 成功面板 =====
  if (result) {
    return (
      <section className="container" style={{ paddingBlock: 64 }}>
        <div className="rule-bold" style={{ marginBottom: 32 }} />
        <div style={{ maxWidth: 640 }}>
          <div className="kicker" style={{ marginBottom: 16 }}>ISSUE 02 · LAUNCHED</div>
          <h1 style={{ marginBottom: 16 }}>
            发射<span className="serif" style={{ color: "var(--gold-deep)" }}>成功</span>
          </h1>
          <p className="serif" style={{ color: "var(--muted)", fontSize: 17, marginBottom: 32 }}>
            你的代币与金库已部署到 BNB Smart Chain，后端已自动排队 BscScan 开源验证。
          </p>

          <div className="dl-list">
            <div className="dl-row">
              <span>Token</span>
              <b className="mono" style={{ wordBreak: "break-all" }}>
                {result.predictedTokenAddress ? (
                  <a href={`${EXPLORER_BASE}/token/${result.predictedTokenAddress}`} target="_blank" rel="noreferrer" style={{ borderBottom: "1px solid var(--gold-deep)" }}>
                    {result.predictedTokenAddress}
                  </a>
                ) : (
                  result.tokenAddress
                )}
              </b>
            </div>
            <div className="dl-row">
              <span>Tx Hash</span>
              <b className="mono" style={{ wordBreak: "break-all" }}>
                <a href={`${EXPLORER_BASE}/tx/${result.hash}`} target="_blank" rel="noreferrer" style={{ borderBottom: "1px solid var(--gold-deep)" }}>
                  {result.hash}
                </a>
              </b>
            </div>
            <div className="dl-row">
              <span>Vanity</span>
              <b className="mono">0x…{result.vanitySuffix} · 尝试 {result.vanityAttempts.toLocaleString()} 次</b>
            </div>
          </div>

          <div className="flex gap-12" style={{ marginTop: 32 }}>
            <Link to={`/project/${result.tokenAddress}`} className="btn btn-primary">查看项目详情 →</Link>
            <Link to="/projects" className="btn">浏览所有发射</Link>
            <button className="btn" onClick={() => setResult(null)}>继续部署</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ paddingBlock: 48 }}>
      <div className="hero-anim hero-anim-1" style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
        <span className="kicker">ISSUE 02</span>
        <span className="serif" style={{ color: "var(--muted)" }}>发射台</span>
      </div>
      <h1 className="hero-anim hero-anim-2" style={{ marginBottom: 16 }}>发射你的<span className="serif goldline" style={{ color: "var(--gold-deep)" }}>第一根香蕉</span></h1>
      <p className="serif hero-anim hero-anim-3" style={{ color: "var(--muted)", fontSize: 17, maxWidth: 640, marginBottom: 48 }}>
        选概念 → 配机制 → 一键部署。后端矿机自动挖 0x…{suffix} 靓号、部署后自动排队开源验证。
      </p>

      <div className="wizard">
        <aside className="w-side">
          {STEPS.map((s, i) => (
            <button
              key={s.n}
              className={`w-step ${i === step ? "on" : ""} ${i < step ? "done" : ""}`}
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
            >
              <span className="n mono">{s.n}</span>
              <span className="t">{s.t}</span>
            </button>
          ))}
        </aside>

        <div className="w-body">
          {/* ===== Step 0 ===== */}
          {step === 0 && (
            <>
              <h2>代币与概念</h2>
              <p className="lede">先给香蕉起名。每个概念是链上独立的 templateId。</p>

              <div className="w-section">
                <h3>概念 / Concept</h3>
                <div className="concept-list">
                  {CONCEPTS.map((c, i) => (
                    <button
                      key={c.key}
                      type="button"
                      className={`concept-pick ${form.conceptKey === c.key ? "on" : ""}`}
                      onClick={() => set("conceptKey", c.key)}
                    >
                      <div className="concept-pick-name">{c.label}</div>
                      <div className="concept-pick-no">{String(i + 1).padStart(2, "0")} · {c.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-section">
                <h3>基础信息 / Basics</h3>
                <div className="w-grid-2">
                  <div className="field">
                    <label>代币名称</label>
                    <input className="input" placeholder="Sun Banana" value={form.name} maxLength={32} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>符号 / Symbol</label>
                    <input className="input" placeholder="BANANA" value={form.symbol} maxLength={12} onChange={(e) => set("symbol", e.target.value.toUpperCase())} />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 24 }}>
                  <label>简介（随 metadata 上链）</label>
                  <textarea
                    className="input"
                    placeholder="简单介绍项目定位、玩法或社区信息"
                    value={form.description}
                    maxLength={480}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </div>
              </div>

              <div className="w-section">
                <h3>头像与社区 / Avatar & Socials</h3>
                <div className="w-grid-2">
                  <div className="field">
                    <label>项目头像（压缩 256px 上传）</label>
                    <div className="flex gap-12 center" style={{ alignItems: "flex-start" }}>
                      {form.avatar ? (
                        <img src={form.avatar} alt="avatar" style={{ width: 72, height: 72, border: "1px solid var(--ink)", borderRadius: 2, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 72, height: 72, border: "1px solid var(--ink)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)" }}>
                          {form.symbol.slice(0, 4) || "AVATAR"}
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <input
                          type="file"
                          accept={AVATAR_TYPES.join(",")}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) void handleAvatar(f);
                          }}
                          disabled={uploading}
                          style={{ fontSize: 13, color: "var(--muted)" }}
                        />
                        {form.avatar && (
                          <button className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => set("avatar", "")}>移除</button>
                        )}
                      </div>
                    </div>
                    <div className="input-hint">{uploading ? "处理中…" : "PNG / JPEG / SVG / GIF / WebP，建议小于 1MB。上传后转存后端资产库。"}</div>
                  </div>
                  <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
                    <div className="field">
                      <label>Telegram</label>
                      <input className="input" placeholder="https://t.me/…" value={form.telegram} onChange={(e) => set("telegram", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>X / Twitter</label>
                      <input className="input" placeholder="https://x.com/…" value={form.xLink} onChange={(e) => set("xLink", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>官网</label>
                      <input className="input" placeholder="https://…" value={form.website} onChange={(e) => set("website", e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ===== Step 1 ===== */}
          {step === 1 && (
            <>
              <h2>融资机制</h2>
              <p className="lede">总供应的 50% 自动预留给流动性，发售即有盘。退款窗口可关闭。</p>

              <div className="w-section">
                <h3>供应 / Supply</h3>
                <div className="w-grid-3">
                  <div className="field">
                    <label>总供应量</label>
                    <input className="input" type="number" min={1} value={form.totalSupply} onChange={(e) => set("totalSupply", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>可铸造数量</label>
                    <input className="input" type="number" min={1} value={form.mintCount} onChange={(e) => set("mintCount", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>铸造单价 ({config.nativeSymbol})</label>
                    <input className="input" type="number" step="0.0000001" min={0} value={form.mintPrice} onChange={(e) => set("mintPrice", e.target.value)} />
                  </div>
                </div>
                <div className="serif" style={{ color: "var(--muted)", fontSize: 14, marginTop: 16 }}>
                  计算：总供应 50% 预留做市 · 每次 Mint 派发 {perMint.toLocaleString()} 枚代币 · 单地址上限 {Number(form.maxMintPerWallet) > 0 ? form.maxMintPerWallet : "不限"}
                </div>
              </div>

              <div className="w-section">
                <h3>机制 / Mechanisms</h3>
                <div className="w-grid-2">
                  <div className="field">
                    <label>单地址上限（0 = 不限）</label>
                    <input className="input" type="number" min={0} value={form.maxMintPerWallet} onChange={(e) => set("maxMintPerWallet", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>退款等待（小时，0 = 关闭）</label>
                    <input className="input" type="number" min={0} max={24} value={form.claimWaitHours} onChange={(e) => set("claimWaitHours", e.target.value)} />
                    <div className="input-hint">{form.claimWaitHours || 0} 小时内未售罄可全额退款；过期自动锁池。</div>
                  </div>
                </div>
                <label className="flex center gap-12" style={{ marginTop: 24, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.whitelistEnabled} onChange={(e) => set("whitelistEnabled", e.target.checked)} style={{ width: 16, height: 16, accentColor: "#0a0a0a" }} />
                  <span className="mono" style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase" }}>启用白名单阶段</span>
                </label>
                {form.whitelistEnabled && (
                  <div className="field" style={{ marginTop: 16, maxWidth: 320 }}>
                    <label>白名单供应量</label>
                    <input className="input" type="number" min={1} value={form.whitelistMintCount} onChange={(e) => set("whitelistMintCount", e.target.value)} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===== Step 2 ===== */}
          {step === 2 && (
            <>
              <h2>税费与分红</h2>
              <p className="lede">买卖税、发射保护税与四档分红分配，总分配上限 100%。</p>

              <div className="w-section">
                <h3>交易税 / Trading Tax</h3>
                <div className="w-grid-2">
                  <Range label="买入" value={form.buyTaxBps} onChange={(v) => set("buyTaxBps", v)} />
                  <Range label="卖出" value={form.sellTaxBps} onChange={(v) => set("sellTaxBps", v)} />
                  <Range label="转账" value={form.transferTaxBps} onChange={(v) => set("transferTaxBps", v)} />
                  <Range label="加池" value={form.addLiquidityTaxBps} onChange={(v) => set("addLiquidityTaxBps", v)} />
                  <Range label="撤池" value={form.removeLiquidityTaxBps} onChange={(v) => set("removeLiquidityTaxBps", v)} />
                  <Range label="发射保护" value={form.launchProtectionTaxBps} onChange={(v) => set("launchProtectionTaxBps", v)} />
                </div>
                <div className="field" style={{ marginTop: 16, maxWidth: 320 }}>
                  <label>发射保护区块（0 = 关闭）</label>
                  <input className="input" type="number" min={0} value={form.launchProtectionBlocks} onChange={(e) => set("launchProtectionBlocks", e.target.value)} />
                </div>
              </div>

              <div className="w-section">
                <h3>分红分配 / Distribution (sum ≤ 100%)</h3>
                <div className="w-grid-2">
                  <Range label="Fund 资金池" value={form.fundFeeBps} onChange={(v) => set("fundFeeBps", v)} max={SPLIT_MAX} />
                  <Range label="LP 回流" value={form.lpFeeBps} onChange={(v) => set("lpFeeBps", v)} max={SPLIT_MAX} />
                  <Range label="持有者分红" value={form.dividendFeeBps} onChange={(v) => set("dividendFeeBps", v)} max={SPLIT_MAX} />
                  <Range label="通缩燃烧" value={form.burnFeeBps} onChange={(v) => set("burnFeeBps", v)} max={SPLIT_MAX} />
                </div>
                <div className="flex between center" style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--rule)" }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>分配总和</span>
                  <span className="mono" style={{ fontSize: 22, color: splitTotal > SPLIT_MAX ? "var(--red)" : "var(--ink)" }}>{(splitTotal / 100).toFixed(2)}%</span>
                </div>
              </div>
            </>
          )}

          {/* ===== Step 3 ===== */}
          {step === 3 && (
            <>
              <h2>确认与部署</h2>
              <p className="lede">部署时后端矿机将自动计算 0x…{suffix} 靓号地址，交易确认后自动排队开源验证。</p>

              {!account ? (
                <div className="w-section">
                  <p className="serif" style={{ fontSize: 16, marginBottom: 16 }}>部署前需要连接钱包（{config.nativeSymbol} 主网）。</p>
                  <button className="btn btn-primary" onClick={() => void connect()}>连接钱包 →</button>
                </div>
              ) : (
                <>
                  {chainId !== config.chainId && (
                    <div className="w-section" style={{ color: "var(--red)" }}>
                      <p className="mono" style={{ fontSize: 13 }}>⚠ 当前钱包在网络 {chainId} 上，请切换到 {config.nativeSymbol} 主网（Chain {config.chainId}）</p>
                      <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={async () => signer && void (await switchToChain(signer.provider as never).catch(() => {}))}>切换网络</button>
                    </div>
                  )}

                  <div className="w-section">
                    <h3>摘要 / Summary</h3>
                    <div className="dl-list">
                      <div className="dl-row"><span>Name</span><b>{form.name || "—"} ({form.symbol.toUpperCase() || "—"})</b></div>
                      <div className="dl-row"><span>Concept</span><b>{CONCEPTS.find((c) => c.key === form.conceptKey)?.label}</b></div>
                      <div className="dl-row"><span>Total Supply</span><b className="mono">{form.totalSupply}</b></div>
                      <div className="dl-row"><span>Mintable</span><b className="mono">{form.mintCount}</b></div>
                      <div className="dl-row"><span>Price</span><b className="mono">{form.mintPrice} {config.nativeSymbol}</b></div>
                      <div className="dl-row"><span>Per Mint</span><b className="mono">{perMint.toLocaleString()} 代币</b></div>
                      <div className="dl-row"><span>LP Reserve</span><b className="mono">50% 预留做市</b></div>
                      <div className="dl-row"><span>Refund</span><b className="mono">{form.claimWaitHours || 0}h 窗口</b></div>
                      <div className="dl-row"><span>Avatar</span><b>{form.avatar ? "已上传" : "无"}</b></div>
                      <div className="dl-row"><span>Creation Fee</span><b className="mono">{creationFee} {config.nativeSymbol}</b></div>
                    </div>
                  </div>

                  <div className="w-section">
                    <button
                      className="btn btn-primary btn-block"
                      style={{ paddingBlock: 16, fontSize: 16 }}
                      onClick={() => void handleDeploy()}
                      disabled={deploying || chainId !== config.chainId}
                    >
                      {deploying ? "部署中：挖盐 → 发交易 → 确认回执…" : `确认发射（${creationFee} ${config.nativeSymbol} 创建费）→`}
                    </button>
                    {deploying && (
                      <p className="serif" style={{ color: "var(--gold-deep)", marginTop: 16, fontSize: 14 }}>
                        后端矿机正在计算 0x…{suffix} 靓号地址，并广播 createLaunch 交易……
                      </p>
                    )}
                  </div>

                  {feeInfo && (
                    <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 32 }}>
                      Factory {config.factoryAddress.slice(0, 8)}… · Deployer {feeInfo.tokenDeployer.slice(0, 10)}…
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* 步骤导航 */}
          <div className="flex between center" style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--ink)" }}>
            <button className="btn" onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))} disabled={deploying}>
              ← {step === 0 ? "返回首页" : "上一步"}
            </button>
            {step < 3 && <button className="btn btn-primary" onClick={() => goto(step + 1)}>下一步 →</button>}
          </div>
        </div>
      </div>
    </section>
  );
}