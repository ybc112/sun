import { NavLink, Link } from "react-router-dom";
import { useWallet } from "../wallet";
import { fmtAddress } from "../config";
import { BananaMark } from "./BananaArt";

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

export function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span style={{ color: "var(--gold-deep)" }}><BananaMark size={18} /></span>
          <span>Banana Mint</span>
          <small>Gold Standard Edition</small>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>首页</NavLink>
          <NavLink to="/launch" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>发射台</NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>项目银河</NavLink>
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}