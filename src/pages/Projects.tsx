import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../lib/data";
import { CardSkeleton, ProgressBar, StatusBadge, Ticker } from "../components/ui";
import { conceptDisplay } from "../lib/concepts";
import { readVault } from "../lib/chain";
import type { LaunchProject } from "../types";
import { fmtPrice } from "../lib/format";
import { EXPLORER_BASE, config } from "../config";

const zero = BigInt(0);

function ProjectCard({ project, index }: { project: LaunchProject; index: number }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [minted, setMinted] = useState<bigint | null>(null);
  const [finalized, setFinalized] = useState<boolean | null>(null);
  const [refundDeadline, setRefundDeadline] = useState<bigint | null>(null);
  const concept = conceptDisplay(project.templateId);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const vault = readVault(project.vault);
        const [finalizedRaw, totalMints, mintedCount, deadline] = await Promise.all([
          vault.finalized(),
          vault.totalMints(),
          vault.mintedCount(),
          vault.refundDeadline(),
        ]);
        if (!mounted) return;
        setFinalized(Boolean(finalizedRaw));
        setMinted(BigInt(mintedCount ?? 0));
        setRefundDeadline(BigInt(deadline ?? 0));
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
      <div className="pc-head">
        <span className="pc-no">№ {String(index + 1).padStart(3, "0")}</span>
        <StatusBadge status={status} />
      </div>
      {project.avatar ? (
        <img src={project.avatar} alt="" style={{ width: 48, height: 48, border: "1px solid var(--ink)", borderRadius: 2, objectFit: "cover", marginBottom: 12 }} />
      ) : (
        <div style={{ width: 48, height: 48, border: "1px solid var(--ink)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>{project.symbol.slice(0, 4) || "TKN"}</div>
      )}
      <div className="pc-name">{project.name || "Unnamed"}</div>
      <div className="pc-symbol">${project.symbol} · {concept.label}</div>
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
      <div className="pc-row">
        <span>Price</span>
        <b className="mono">{fmtPrice(project.mintPrice)} {config.nativeSymbol}</b>
      </div>
      <div className="pc-foot">
        <span>0x…{project.address.slice(-4)}</span>
        <span>{progress !== null ? `${(progress / 100).toFixed(1)}%` : "…"}</span>
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

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, borderBottom: "1px solid var(--ink)", paddingBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", flex: "none" }}>Search</span>
          <input
            className="input"
            placeholder="按名称 / 符号 / 地址过滤"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ maxWidth: 360 }}
          />
        </div>

        {error && (
          <div className="serif" style={{ color: "var(--red)", padding: 24, border: "1px solid var(--red)", marginBottom: 24 }}>
            ⚠ {error}（请确认后端与 BSC RPC 可用，或刷新重试）
          </div>
        )}

        <div className="project-grid">
          {filtered.map((p, i) => (
            <ProjectCard key={p.address} project={p} index={i} />
          ))}
          {loading && [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
        </div>

        {!done && !loading && (
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="btn" onClick={() => void loadMore()}>加载更多 →</button>
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