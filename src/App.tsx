import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { WalletProvider } from "./wallet";
import { ToastProvider } from "./components/Toast";
import { Nav } from "./components/Nav";
import Home from "./pages/Home";
import Launch from "./pages/Launch";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import { config, EXPLORER_BASE } from "./config";
import "./styles/global.css";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <ScrollTop />
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/launch" element={<Launch />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:address" element={<ProjectDetail />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <div className="colophon">
              <div>
                <h4>Colophon</h4>
                <p>Banana Mint — Gold Standard Edition. Set in Inter & Source Serif, by the Banana Editorial Office.</p>
              </div>
              <div>
                <h4>Stack</h4>
                <p>Vite · React · TypeScript · ethers v6. Contracts audited on BscScan, deployed on BSC mainnet.</p>
              </div>
              <div>
                <h4>Factory</h4>
                <p style={{ wordBreak: "break-all" }}>{config.factoryAddress}</p>
                <p><a href={`${EXPLORER_BASE}/address/${config.factoryAddress}`} target="_blank" rel="noreferrer" style={{ borderBottom: "1px solid var(--rule)" }}>View on BscScan →</a></p>
              </div>
              <div>
                <h4>Disclaimer</h4>
                <p>本平台所有叙事、名人互动与"$45,000,000 最贵香蕉"相关文案均为概念包装与纪念性表达，不代表任何真实代言。Meme 与代币存在极高波动风险，参与前请自行研究（DYOR）。</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--rule)", paddingTop: 20, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
              <span>© Banana Editorial · MMXXVI</span>
              <span>BSC · MAINNET</span>
            </div>
          </div>
        </footer>
      </ToastProvider>
    </WalletProvider>
  );
}