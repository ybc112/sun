import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useWallet } from "../wallet";
import { fmtAddress } from "../config";
import { BananaLogo } from "./BananaArt";

export function WalletButton() {
  const { account, connect, disconnect, connecting, error } = useWallet();

  if (account) {
    return (
      <div className="flex gap-12 center">
        <span className="tag tag-solid mono">
          <span style={{ display: "inline-block", width: 6, height: 6, background: "var(--green)", borderRadius: "50%", marginRight: 6, verticalAlign: "middle" }} />
          {fmtAddress(account)}
        </span>
        <button className="btn btn-sm" onClick={disconnect}>断开</button>
      </div>
    );
  }

  return (
    <div className="flex gap-12 center">
      {error && <span className="tag tag-red">{error.length > 28 ? error.slice(0, 28) + "…" : error}</span>}
      <button className="btn btn-primary btn-sm" onClick={() => void connect()} disabled={connecting}>
        {connecting ? "…" : "连接钱包"}
      </button>
    </div>
  );
}

const LINKS = [
  { to: "/", label: "首页", end: true },
  { to: "/launch", label: "发射台", end: false },
  { to: "/projects", label: "已发射代币", end: false },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <BananaLogo size={28} />
          <span>
            Banana Mint
            <small>Gold Standard Edition</small>
          </span>
        </Link>

        {/* 桌面端导航 */}
        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* 移动端：钱包 + 汉堡 */}
        <div className="nav-mobile">
          <WalletButton />
          <button
            type="button"
            className={`nav-burger ${open ? "open" : ""}`}
            aria-label="打开菜单"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 移动端下拉面板 */}
      <div className={`nav-dropdown ${open ? "open" : ""}`}>
        {LINKS.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `nav-drop-item ${isActive ? "active" : ""}`}
            onClick={() => setOpen(false)}
          >
            <span className="nd-no">0{i + 1}</span>
            <span className="nd-label">{l.label}</span>
          </NavLink>
        ))}
      </div>
    </header>
  );
}