import type { ReactNode } from "react";
import { fmtAddress } from "../config";

/** 区块标题 —— 编号 + 标题 + 副文（左对齐、衬线副文、编辑感） */
export function SectionTitle({
  number,
  title,
  intro,
}: {
  number: string;
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <div className="kicker">{number}</div>
        <h2 style={{ marginTop: 14 }}>{title}</h2>
      </div>
      {intro && <p>{intro}</p>}
    </div>
  );
}

/** 跑马灯 */
export function Ticker({ items }: { items: string[] }) {
  const track = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {track.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}

/** 细线进度条 */
export function ProgressBar({ value, max = 10000 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** 复制的地址 */
export function AddressChip({
  address,
  suffix,
  link,
  length = "short",
}: {
  address: string;
  suffix?: string;
  link?: string;
  length?: "short" | "full";
}) {
  const display = length === "short" ? fmtAddress(address) : address;
  const inner = (
    <span
      className="addr"
      title="点击复制"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void navigator.clipboard?.writeText(address).catch(() => {});
      }}
    >
      {display}
      {suffix && <span className="addr-suffix">{suffix}</span>}
    </span>
  );
  if (!link) return inner;
  return (
    <a href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
      {inner}
    </a>
  );
}

/** 加载骨架（极简一条线） */
export function CardSkeleton() {
  return (
    <div className="project-card">
      <div className="pc-head">
        <span className="pc-no">···</span>
        <span className="pc-status">LOAD</span>
      </div>
      <div style={{ height: 22, background: "var(--line-strong)", width: "60%", marginBottom: 16 }} />
      <div style={{ height: 1, background: "var(--line)" }} />
      <div style={{ height: 12, background: "var(--line-strong)", width: "80%", marginTop: 12 }} />
    </div>
  );
}

/** 状态徽章 —— 编辑感分类标签 */
export function StatusBadge({ status }: { status: string }) {
  if (status === "open") return <span className="pc-status live">● LIVE</span>;
  if (status === "soldout") return <span className="pc-status">SOLD OUT</span>;
  if (status === "refunding") return <span className="pc-status" style={{ color: "var(--red)", borderColor: "var(--red)" }}>REFUND</span>;
  if (status === "finalized") return <span className="pc-status done">LOCKED</span>;
  return <span className="pc-status">—</span>;
}