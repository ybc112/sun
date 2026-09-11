import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Contract } from "ethers";
import { useWallet } from "../wallet";
import { useToast } from "../components/Toast";
import { useProjectDetail } from "../lib/data";
import { AddressChip, ProgressBar, StatusBadge } from "../components/ui";
import { readVault, switchToChain, vaultAbi, publicProvider } from "../lib/chain";
import { conceptDisplay } from "../lib/concepts";
import { fmtCountdown, fmtNumber, fmtPrice } from "../lib/format";
import { config, EXPLORER_BASE } from "../config";
import { verifyStatus } from "../lib/api";

const zero = BigInt(0);

export default function ProjectDetail() {
  const { address = "" } = useParams();
  const { account, signer, connect, chainId } = useWallet();
  const toast = useToast();
  const { project, vault, loading, error, refresh } = useProjectDetail(address, account);

  const [qty, setQty] = useState(1);
  const [minting, setMinting] = useState(false);
  const [canRefund, setCanRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [verifyJob, setVerifyJob] = useState<unknown>(null);
  const [unpaidDividend, setUnpaidDividend] = useState<bigint>(zero);

  const concept = conceptDisplay(project?.templateId || "");

  // 我的未领取分红（持币自动分红）
  useEffect(() => {
    let mounted = true;
    if (!project?.address || !account) {
      setUnpaidDividend(zero);
      return;
    }
    void (async () => {
      try {
        const t = new Contract(project.address, ["function unpaidDividend(address) view returns (uint256)"], publicProvider);
        const value = await t.unpaidDividend(account);
        if (mounted) setUnpaidDividend(BigInt(value ?? 0));
      } catch {
        if (mounted) setUnpaidDividend(zero);
      }
    })();
    return () => { mounted = false; };
  }, [project?.address, account]);

  useEffect(() => {
    let mounted = true;
    if (!project?.vault || !account) {
      setCanRefund(false);
      return;
    }
    void (async () => {
      try {
        const ok = await readVault(project.vault).canRefund(account);
        if (mounted) setCanRefund(Boolean(ok));
      } catch {
        if (mounted) setCanRefund(false);
      }
    })();
    return () => { mounted = false; };
  }, [project?.vault, account, vault?.finalized, vault?.mintedCount]);

  useEffect(() => {
    void verifyStatus(address)
      .then((r) => setVerifyJob(r.job))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const quote = useMemo(() => {
    if (!vault) return zero;
    return vault.mintPrice * BigInt(qty);
  }, [vault, qty]);

  const nowSec = Math.floor(Date.now() / 1000);
  const refundCountdown = vault ? Number(vault.refundDeadline) - nowSec : 0;
  const inRefundWindow = vault && !vault.finalized && vault.mintedCount < vault.totalMints && refundCountdown > 0;
  const soldOut = vault ? vault.mintedCount >= vault.totalMints : false;

  const handleMint = async () => {
    if (!signer || !project?.vault) return;
    setMinting(true);
    setTxHash("");
    try {
      await switchToChain(signer.provider as never);
      const vaultContract = new Contract(project.vault, vaultAbi, signer);
      const tx = await vaultContract.mint(qty, { value: quote });
      setTxHash(tx.hash);
      toast("铸造交易已广播…", "info");
      const receipt = await tx.wait();
      if (receipt?.status === 1) {
        toast("✅ 铸造成功", "ok");
        void refresh();
      } else {
        toast("交易上链但状态异常", "err");
      }
    } catch (e) {
      const msg = e instanceof Error ? (e as { shortMessage?: string }).shortMessage || e.message : "铸造失败";
      if (/user rejected|denied/i.test(msg)) toast("已取消签名", "info");
      else toast(msg, "err");
    } finally {
      setMinting(false);
    }
  };

  const handleRefund = async () => {
    if (!signer || !project?.vault) return;
    setRefunding(true);
    try {
      const vaultContract = new Contract(project.vault, vaultAbi, signer);
      const tx = await vaultContract.claimRefund();
      toast("退款交易已广播…", "info");
      const receipt = await tx.wait();
      if (receipt?.status === 1) {
        toast("✅ 退款成功", "ok");
        void refresh();
      } else {
        toast("退款交易状态异常", "err");
      }
    } catch (e) {
      const msg = e instanceof Error ? (e as { shortMessage?: string }).shortMessage || e.message : "退款失败";
      if (/user rejected|denied/i.test(msg)) toast("已取消签名", "info");
      else toast(msg, "err");
    } finally {
      setRefunding(false);
    }
  };

  if (loading && !project) {
    return (
      <section className="container" style={{ paddingBlock: 60 }}>
        <div style={{ height: 1, background: "var(--ink)", marginBottom: 16 }} />
        <div style={{ height: 60, background: "var(--rule)", width: 360, marginBottom: 12 }} />
        <div style={{ height: 24, background: "var(--rule)", width: 240 }} />
      </section>
    );
  }

  if (error && !project) {
    return (
      <section className="container" style={{ paddingBlock: 80 }}>
        <div style={{ border: "1px solid var(--red)", padding: 32, textAlign: "center" }}>
          <p className="serif" style={{ color: "var(--red)", fontSize: 18, marginBottom: 16 }}>无法读取该项目：{error}</p>
          <Link to="/projects" className="btn">返回项目银河</Link>
        </div>
      </section>
    );
  }

  if (!project) return null;

  const status = vault ? (vault.finalized ? "finalized" : soldOut ? "soldout" : inRefundWindow ? "refunding" : "open") : "unknown";

  return (
    <section className="container" style={{ paddingBlock: 0 }}>
      {/* 头部 */}
      <div className="detail-head">
        <div>
          <div className="dh-meta">
            <span>{concept.label}</span>
            <span>·</span>
            <StatusBadge status={status} />
            <span>·</span>
            <span>{verifyJob ? "VERIFY QUEUED" : "VERIFY PENDING"}</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
            {project.avatar ? (
              <img src={project.avatar} alt={project.name} style={{ width: 72, height: 72, border: "1px solid var(--ink)", borderRadius: 2, objectFit: "cover", flex: "none" }} />
            ) : (
              <div style={{ width: 72, height: 72, border: "1px solid var(--ink)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--muted)", flex: "none" }}>
                {project.symbol.slice(0, 4) || "TKN"}
              </div>
            )}
            <h1 className="dh-title" style={{ margin: 0 }}>
              <small>{concept.label.toUpperCase()}</small>
              {project.name || "Unnamed"}
              <span style={{ color: "var(--gold-deep)" }}> · {project.symbol}</span>
            </h1>
          </div>
          {project.description ? (
            <p className="dh-quote" style={{ fontStyle: "normal", fontSize: 15 }}>{project.description}</p>
          ) : (
            <p className="dh-quote" style={{ fontSize: 14 }}>
              由 <b style={{ color: "var(--ink)" }}>{project.creator.slice(0, 8)}…</b> 创建于 {new Date(Number(project.createdAt) * 1000).toLocaleDateString()} ·
              分红代币 {project.rewardToken === "0x0000000000000000000000000000000000000000" ? "USDT" : `${project.rewardToken.slice(0, 8)}…`} ·
              分红门槛 {fmtNumber(project.rewardThreshold, 18, 0)}
            </p>
          )}
          <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
            <AddressChip address={project.address} suffix={`…${project.address.slice(-4)}`} link={`${EXPLORER_BASE}/token/${project.address}`} />
            <span className="serif" style={{ color: "var(--muted)", fontSize: 14 }}>代币</span>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
            <AddressChip address={project.vault} link={`${EXPLORER_BASE}/address/${project.vault}`} />
            <span className="serif" style={{ color: "var(--muted)", fontSize: 14 }}>金库</span>
          </div>
        </div>
      </div>

      {/* 主区 */}
      <div className="detail-grid">
        <div>
          {/* 数据列表 */}
          <div className="kicker" style={{ marginBottom: 24 }}>Vault · 金库</div>
          <div className="dl-list">
            <div className="dl-row"><span>Total Supply</span><b className="mono">{fmtNumber(project.totalSupply)}</b></div>
            <div className="dl-row"><span>LP Reserve (50%)</span><b className="mono">{fmtNumber(vault?.liquidityTokenReserve ?? project.totalSupply / BigInt(2))}</b></div>
            <div className="dl-row"><span>Per Mint</span><b className="mono">{fmtNumber(vault?.tokensPerMint ?? zero, 18, 2)}</b></div>
            <div className="dl-row"><span>Minted / Cap</span><b className="mono">{vault ? `${vault.mintedCount.toLocaleString()} / ${vault.totalMints.toLocaleString()}` : "—"}</b></div>
            <div className="dl-row"><span>Whitelist Sold</span><b className="mono">{vault?.whitelistMintedCount.toLocaleString() ?? "—"}</b></div>
            <div className="dl-row"><span>Public Sold</span><b className="mono">{vault?.publicMintedCount.toLocaleString() ?? "—"}</b></div>
            <div className="dl-row"><span>Per Wallet Cap</span><b className="mono">{vault && vault.maxMintPerWallet > zero ? vault.maxMintPerWallet.toLocaleString() : "Unlimited"}</b></div>
          </div>

          <div className="kicker" style={{ marginTop: 48, marginBottom: 24 }}>Tax Engine · 税费引擎</div>
          <div className="dl-list">
            <div className="dl-row"><span>Buy Tax</span><b className="mono">{project.buyTaxBps ? `${(project.buyTaxBps / 100).toFixed(2)}%` : "0%"}</b></div>
            <div className="dl-row"><span>Sell Tax</span><b className="mono">{project.sellTaxBps ? `${(project.sellTaxBps / 100).toFixed(2)}%` : "0%"}</b></div>
            <div className="dl-row"><span>Transfer Tax</span><b className="mono">{project.transferTaxBps ? `${(project.transferTaxBps / 100).toFixed(2)}%` : "0%"}</b></div>
            <div className="dl-row"><span>Add LP Tax</span><b className="mono">{project.addLiquidityTaxBps ? `${(project.addLiquidityTaxBps / 100).toFixed(2)}%` : "0%"}</b></div>
            <div className="dl-row"><span>Remove LP Tax</span><b className="mono">{project.removeLiquidityTaxBps ? `${(project.removeLiquidityTaxBps / 100).toFixed(2)}%` : "0%"}</b></div>
            <div className="dl-row"><span>Launch Protection</span><b className="mono">{project.launchProtectionTaxBps ? `${(project.launchProtectionTaxBps / 100).toFixed(2)}%` : "0%"} × {project.launchProtectionBlocks} blocks</b></div>
            <div className="dl-row"><span>Refund Window</span><b className="mono">{project.claimWait ? `${project.claimWait}s` : "Disabled"}</b></div>
            <div className="dl-row"><span>Distribution · Fund / LP / Div / Burn</span><b className="mono">{project.fundFeeBps / 100}% / {project.lpFeeBps / 100}% / {project.dividendFeeBps / 100}% / {project.burnFeeBps / 100}%</b></div>
          </div>

          <p className="serif" style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7, marginTop: 32, maxWidth: 640 }}>
            参与即表示你理解 Meme 代币的风险：价格可能归零、退款仅在未售罄且退款窗口内生效、锁池发生在售罄 finalize 时。
            DCA、DYOR。本页数据来自 BSC 链上实时读取，交易经由你的钱包签名，私钥永不上传。
          </p>
        </div>

        {/* Mint 侧栏 */}
        <aside className="mint-panel">
          <div className="kicker" style={{ marginBottom: 8 }}>Mint</div>
          <div className="mint-price">
            {vault ? fmtPrice(vault.mintPrice) : "—"}<small>{config.nativeSymbol}</small>
          </div>
          <div style={{ marginTop: 16 }}>
            <ProgressBar value={vault?.progressBps ?? 0} />
            <div className="mint-progress">
              <span>Progress</span>
              <b>{vault ? `${vault.mintedCount.toLocaleString()} / ${vault.totalMints.toLocaleString()}` : "—"}</b>
            </div>
          </div>

          {vault?.whitelistEnabled && (
            <div style={{ border: "1px solid var(--ink)", padding: 12, fontSize: 12, marginBottom: 16, fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>
              WHITELIST PHASE {account && vault.whitelisted ? "· YOU'RE IN" : "· WALLET NOT LISTED"}
            </div>
          )}

          {account && project.dividendFeeBps > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 0", borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)", marginBottom: 16, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)" }}>
              <span>我的分红 · Unpaid</span>
              <b style={{ color: "var(--gold-deep)", fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
                {fmtNumber(unpaidDividend, 18, 4)}
              </b>
            </div>
          )}

          {account && vault && !vault.finalized && !soldOut ? (
            <>
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <input type="text" value={qty} readOnly />
                <button onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
              {vault.maxMintPerWallet > zero && (
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".06em", marginTop: 8 }}>
                  上限 {vault.maxMintPerWallet.toLocaleString()} · 已用 {vault.mintedByWallet.toLocaleString()} · 剩余 {Math.max(0, Number(vault.maxMintPerWallet - vault.mintedByWallet))}
                </div>
              )}
              <div className="mint-total">
                <small>合计 / Total</small>
                <b>{fmtPrice(quote)} {config.nativeSymbol}</b>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={() => void handleMint()}
                disabled={minting || chainId !== config.chainId || (vault.whitelistEnabled && !vault.whitelisted)}
              >
                {minting ? "广播中…" : "立即铸造 →"}
              </button>
            </>
          ) : account && vault?.finalized ? (
            <p className="serif" style={{ fontSize: 15, lineHeight: 1.6, padding: 16, border: "1px solid var(--ink)" }}>
              ✅ 发射已完成：LP 已锁黑洞，代币已流通，进入二级市场交易阶段。
            </p>
          ) : account && soldOut ? (
            <p className="serif" style={{ fontSize: 15, lineHeight: 1.6, padding: 16, border: "1px solid var(--ink)" }}>
              全部 Mint 已售罄，进入 finalize / 锁池流程。
            </p>
          ) : (
            <button className="btn btn-primary btn-block" onClick={() => void connect()}>连接钱包开始铸造</button>
          )}

          {inRefundWindow && (
            <div style={{ marginTop: 16, padding: 12, border: "1px solid var(--rule)", fontSize: 12, textAlign: "center", fontFamily: "var(--font-serif)" }}>
              退款窗口剩余 <b style={{ color: "var(--gold-deep)" }}>{fmtCountdown(refundCountdown)}</b>
              {canRefund && (
                <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => void handleRefund()} disabled={refunding}>
                  {refunding ? "广播中…" : "我要退款"}
                </button>
              )}
            </div>
          )}

          {txHash && (
            <div style={{ marginTop: 16, textAlign: "center", fontSize: 12 }}>
              <a href={`${EXPLORER_BASE}/tx/${txHash}`} target="_blank" rel="noreferrer" style={{ borderBottom: "1px solid var(--rule)", fontFamily: "var(--font-mono)" }}>{txHash.slice(0, 14)}…</a>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}