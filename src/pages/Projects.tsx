import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../lib/data";
import { CardSkeleton, ProgressBar, StatusBadge, Ticker } from "../components/ui";
import { Reveal } from "../components/Reveal";
import { conceptDisplay } from "../lib/concepts";
import { readVault } from "../lib/chain";
import type { LaunchProject } from "../types";
import { fmtPrice } from "../lib/format";
import { EXPLORER_BASE, config } from "../config";

const zero = BigInt(0);

/** 复制按钮（对齐 KimiMint 列表体验） */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 忽略 */
    }
  };
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        void copy();
      }}
      style={{ marginLeft: 8, border: "1px solid var(--rule)", padding: "1px 6px", fontSize: 10, fontFamily: "var(--font-mono)", color: copied ? "var(--gold-deep)" : "var(--muted)", cursor: "pointer", background: "transparent" }}
      title="复制地址"
    >
      {copied ? "COPIED" : "COPY"}
    </button>
  );
}

function ProjectCard({ project, index }: { project: LaunchProject; index: number }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [minted, setMinted] = useState<bigint | null>(null);
  const [finalized, setFinalized] = useState<boolean | null>(null);
  const [refundDeadline, setRefundDeadline] = useState<bigint | null>(null);
  const [wlEnabled, setWlEnabled] = useState(false);
  const [wlMinted, setWlMinted] = useState("—");
  const [pubMinted, setPubMinted] = useState("—");
  const concept = conceptDisplay(project.templateId);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const vault = readVault(project.vault);
        const [finalizedRaw, totalMints, mintedCount, deadline, wlOn, wlMintedRaw, pubMintedRaw] = await Promise.all([
          vault.finalized(),
          vault.totalMints(),
          vault.mintedCount(),
          vault.refundDeadline(),
          vault.whitelistEnabled(),
          vault.whitelistMintedCount().catch(() => 0n),
          vault.publicMintedCount().catch(() => 0n),
        ]);
        if (!mounted) return;
        setFinalized(Boolean(finalizedRaw));
        setMinted(BigInt(mintedCount ?? 0));
        setRefundDeadline(BigInt(deadline ?? 0));
        setWlEnabled(Boolean(wlOn));
        setWlMinted(BigInt(wlMintedRaw ?? 0).toLocaleString() + "/" + project.whitelistMintCount.toLocaleString());
        setPubMinted(BigInt(pubMintedRaw ?? 0).toLocaleString() + "/" + (project.mintCount - project.whitelistMintCount).toLocaleString());
        const total = BigInt(totalMints ?? 1);
        setProgress(total > zero ? Number((BigInt(mintedCount ?? 0) * BigInt(10000)) / total) : 0);
      } catch {
        /* */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [project]);

  const nowSec = Math.floor(Date.now() / 1000);
  const status = finalized
    ? "finalized"
    : refundDeadline && nowSec > Number(refundDeadline) && minted !== null && minted < project.mintCount
      ? "refunding"
      : minted !== null && minted >= project.mintCount
        ? "soldout"
        : "open";

  return (
    <Link to={`/project/${project.address}`} className="project-card">
      <div className="pc-head" style={{ marginBottom: 18, alignItems: "center" }}>
        <span className="pc-no">№ {String(index + 1).padStart(3, "0")}</span>
        <StatusBadge status={status} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        {project.avatar ? (
          <img src={project.avatar} alt="" style={{ width: 48, height: 48, border: "1px solid var(--ink)", borderRadius: 2, objectFit: "cover", flex: "none" }} />
        ) : (
          <div style={{ width: 48, height: 48, border: "1px solid var(--ink)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", flex: "none" }}>{project.symbol.slice(0, 4) || "TKN"}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <div className="pc-name" style={{ fontSize: 20, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name || "Unnamed"}</div>
          <div className="pc-symbol">${project.symbol} · {concept.label}</div>
        </div>
      </div>
      {project.description && (
        <p className="serif" style={{ fontSize: 13, color: "var(--muted)", marginTop: 8, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {project.description}
        </p>
      )}
      <div style={{ marginTop: 20 }}>
        <ProgressBar value={progress ?? 0} />
      </div>
      <div className="pc-row" style={{ marginTop: 18 }}>
        <span>Minted</span>
        <b className="mono">{minted !== null ? minted.toLocaleString() : "—"} <span style={{ color: "var(--muted)" }}>/ {project.mintCount.toLocaleString()}</span></b>
      </div>
      {wlEnabled && (
        <div className="pc-row">
          <span>白名单 · 公开</span>
          <b className="mono" style={{ fontSize: 12 }}>{wlMinted} · {pubMinted}</b>
        </div>
      )}
      <div className="pc-row">
        <span>Price</span>
        <b className="mono">{fmtPrice(project.mintPrice)} {config.nativeSymbol}</b>
      </div>
      <div className="pc-row">
        <span>Vault</span>
        <b className="mono" style={{ fontSize: 12 }}>0x…{project.vault.slice(-4)}<CopyButton text={project.vault} /></b>
      </div>
      <div className="pc-foot">
        <span>0x…{project.address.slice(-4)}<CopyButton text={project.address} /></span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {finalized && (
            <a
              href={`https://pancakeswap.finance/swap?outputCurrency=${project.address}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--gold-deep)", borderBottom: "1px solid var(--gold-deep)" }}
              onClick={(e) => e.stopPropagation()}
            >
              交易 →
            </a>
          )}
          <span>{progress !== null ? `${(progress / 100).toFixed(1)}%` : "…"}</span>
        </span>
      </div>
    </Link>
  );
}

export default function Projects() {
  const { projects, loading, error, total, done, loadMore } = useProjects(9);
  const [keyword, setKeyword] = useState("");

  const filtered = keyword
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword.toLowerCase()) ||
          p.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
          p.address.toLowerCase().includes(keyword.toLowerCase()),
      )
    : projects;

  return (
    <>
      <Ticker items={["The Project Index", `已索引 ${total} 个发射`, "数据源：BSC 公共 RPC", "实时同步链上"]} />
      <section className="container" style={{ paddingBlock: 48 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
          <span className="kicker">ISSUE 03</span>
          <span className="serif" style={{ color: "var(--muted)" }}>项目索引</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 60, alignItems: "end", marginBottom: 48 }}>
          <h1>正在上链的<span className="serif" style={{ color: "var(--gold-deep)" }}>香蕉们</span></h1>
          <p className="serif" style={{ color: "var(--muted)", fontSize: 17 }}>
            从 Factory 实时读取，共 {total} 个项目。点击卡片查看详情与铸造。
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, borderBottom: "1px solid var(--ink)", paddingBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", flex: "none" }}>Search</span>
          <input
            className="input"
            placeholder="按名称 / 符号 / 地址过滤"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <span style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={() => window.location.reload()}>
            刷新 ↗
          </button>
          <Link to="/launch" className="btn btn-primary">
            去发射 →
          </Link>
        </div>

        {error && (
          <div className="serif" style={{ color: "var(--red)", padding: 24, border: "1px solid var(--red)", marginBottom: 24 }}>
            ⚠ {error}（请确认后端与 BSC RPC 可用，或刷新重试）
          </div>
        )}

        <div className="project-grid">
          {filtered.map((p, i) => (
            <Reveal key={p.address} delay={i % 3}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
          {loading && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>

        {!done && !loading && (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="btn" onClick={() => void loadMore()}>加载更多 <span className="arr">→</span></button>
          </div>
        )}
        {done && projects.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 48, fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--muted)", fontSize: 14 }}>
            — 以上就是全部 {projects.length} 个项目 —
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div style={{ padding: 48, border: "1px solid var(--ink)", textAlign: "center" }}>
            <p className="serif" style={{ color: "var(--muted)", fontSize: 16, marginBottom: 16 }}>还没有任何发行。</p>
            <Link to="/launch" className="btn btn-primary">成为第一个发射的人 →</Link>
            <p className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 24, letterSpacing: ".06em" }}>链上数据：{EXPLORER_BASE}</p>
          </div>
        )}
      </section>
    </>
  );
}