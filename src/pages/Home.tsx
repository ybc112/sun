import { Link } from "react-router-dom";
import { BananaArt } from "../components/BananaArt";
import { SectionTitle, Ticker } from "../components/ui";
import { CONCEPTS, MECHANISMS } from "../lib/concepts";
import { config, EXPLORER_BASE } from "../config";

const TICKER = [
  "最贵香蕉 $45,000,000 成交",
  "地址后缀 0x7777 靓号铸造",
  "24 小时退款险",
  "持币自动分红",
  "售罄 LP 永久锁死黑洞",
  "每笔 Mint 自动做市",
  "交易即燃烧 通缩循环",
  "合约自动 BscScan 开源验证",
];

const TIMELINE = [
  {
    year: "2019",
    season: "起源",
    title: "一件名为《喜剧演员》的艺术品",
    body: "一根香蕉用胶带贴在墙上，被命名为 Comedian。它开始质询一个古老的问题——什么是价值？",
  },
  {
    year: "2024",
    season: "高潮",
    title: "孙晨宇以 $6.2M 买下并当场吃掉",
    body: "加密货币企业家 Justin Sun 在拍下后当场剥开这根香蕉吃下——这是年度最出圈的 meme 时刻。",
  },
  {
    year: "2026",
    season: "加冕",
    title: "估价 $45,000,000，史上最贵",
    body: "多年后，它的叙事价值一路上涨到 $45M。它证明了：meme 就是共识，共识就是价格。",
  },
  {
    year: "今天",
    season: "应用",
    title: "香蕉能量，现在可以用来发币",
    body: "黄金香蕉发射台把这根史上最贵香蕉的流量与叙事，变成任何人一键上链发币的引擎。",
  },
];

const VOICES = [
  {
    name: "Justin Sun · 孙晨宇",
    role: "香蕉藏家",
    quote: "这香蕉我吃定了。$45M 算什么，我有的是流动性。",
  },
  {
    name: "CZ · 赵长鹏",
    role: "币圈劳模",
    quote: "香蕉比空气币实在——至少剥开能闻见味儿。",
  },
  {
    name: "Vitalik Buterin",
    role: "技术诗人",
    quote: "我试过把香蕉写进 EIP，被社区否决了。整挺好。",
  },
  {
    name: "Arthur Hayes",
    role: "牛市预言家",
    quote: "杠杆之后再啃口香蕉，回撤就不慌了。",
  },
];

export default function Home() {
  return (
    <>
      <Ticker items={TICKER} />

      {/* ===== Hero（编辑专栏感） ===== */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow">
                <span>ISSUE 01</span>
                <span>The $45M Banana</span>
              </div>
              <h1>
                最贵的一根香蕉
                <span className="price">$45,000,000</span>
              </h1>
              <p className="hero-lede">
                一根香蕉被贴上墙、被买下、被吃掉、被估值到四千五百万美元。
                现在它不再只是艺术品——它是 BSC 上任何人发射代币的引擎。
              </p>
              <div className="flex gap-12" style={{ marginTop: 36 }}>
                <Link to="/launch" className="btn btn-primary">立即发射 →</Link>
                <Link to="/projects" className="btn">浏览项目</Link>
              </div>
              <div className="hero-meta">
                <div>
                  <b>8+</b>
                  <span>概念模板</span>
                </div>
                <div>
                  <b>0x7777</b>
                  <span>靓号后缀</span>
                </div>
                <div>
                  <b>24h</b>
                  <span>退款窗口</span>
                </div>
                <div>
                  <b>100%</b>
                  <span>LP 锁黑洞</span>
                </div>
              </div>
            </div>

            <aside className="hero-ticket">
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
                <span>NO. 01 / BANANA</span>
                <span>EST. 2019</span>
              </div>
              <div className="ticket-row"><span>Title</span><b>Comedian</b></div>
              <div className="ticket-row"><span>Artist</span><b>Maurizio Cattelan</b></div>
              <div className="ticket-row"><span>Sale · 2019</span><b>$120,000</b></div>
              <div className="ticket-row"><span>Sale · 2024</span><b>$6,200,000</b></div>
              <div className="ticket-row"><span>Est. 2026</span><b style={{ color: "var(--gold-deep)" }}>$45,000,000</b></div>
              <div className="ticket-stamp">★ CERTIFIED MEME ★</div>
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <BananaArt size={140} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== 香蕉传奇时间线（编辑感） ===== */}
      <section className="section">
        <div className="container">
          <SectionTitle
            number="§ 01 — The Legend"
            title={<>从 $6,200,000<br />到 $45,000,000</>}
            intro="一段关于「一根香蕉如何成为全球最贵 meme」的叙事，现在是你的项目入场券。"
          />
          <div className="timeline">
            {TIMELINE.map((item) => (
              <div className="tl-row" key={item.year}>
                <div className="tl-year">
                  {item.year}
                  <small>{item.season}</small>
                </div>
                <div className="tl-body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 声援墙（编辑感对谈） ===== */}
      <section className="section">
        <div className="container">
          <SectionTitle
            number="§ 02 — Voices"
            title={<>币圈大佬<br />都在聊的香蕉</>}
            intro="以下为概念包装与致敬表达，非真实代言。"
          />
          <div className="voices">
            {VOICES.map((v) => (
              <div className="voice" key={v.name}>
                <div className="voice-attr">
                  <span className="voice-name">{v.name}</span>
                  <span className="voice-role">{v.role}</span>
                </div>
                <p className="voice-quote">{v.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 概念（表格感） ===== */}
      <section className="section">
        <div className="container">
          <SectionTitle
            number="§ 03 — Concepts"
            title={<>八个概念打法，<br />一个发射台</>}
            intro="每个概念对应链上独立的 templateId。概念即身份，上链即认证。"
          />
          <div className="concept-table">
            {CONCEPTS.map((c, i) => (
              <Link to="/launch" className="concept-row" key={c.key}>
                <span className="concept-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="concept-name">
                  {c.label}
                  <small>{c.key.toUpperCase().replace(/-/g, " · ")}</small>
                </span>
                <span className="concept-tag">{c.tagline}</span>
                <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)" }}>{c.desc}</span>
                <span className="concept-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 机制（密集列表） ===== */}
      <section className="section">
        <div className="container">
          <SectionTitle
            number="§ 04 — Mechanism"
            title={<>机制自由组合，<br />拒绝千篇一律</>}
            intro="从自动做市到 24 小时退款险，按你的叙事自由装配。"
          />
          <div className="mech-list">
            {MECHANISMS.map((m, i) => (
              <div className="mech-item" key={m.key}>
                <span className="mech-no">{String(i + 1).padStart(2, "0")} /</span>
                <div>
                  <div className="mech-name">{m.title}</div>
                  <div className="mech-desc">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA（编辑感广告位） ===== */}
      <section className="section" style={{ background: "var(--ink)", color: "var(--paper)", borderBottom: 0 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80, alignItems: "end" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold-bright)" }}>
                § 05 — Your Turn
              </div>
              <h2 style={{ marginTop: 14, color: "var(--paper)" }}>
                让全世界记住你的<br />
                <span className="serif" style={{ color: "var(--gold-bright)" }}>第一根香蕉</span>
              </h2>
              <p className="hero-lede" style={{ color: "var(--paper-3)" }}>
                连接钱包 → 选概念 → 配机制 → 靓号铸造 → 一键发射。
                全程 BSC 链上，后端自动开源验证。
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
              <Link to="/launch" className="btn btn-gold" style={{ background: "var(--gold)", borderColor: "var(--gold)", color: "var(--ink)" }}>
                开始发射 →
              </Link>
              <a className="btn" style={{ color: "var(--paper)", borderColor: "var(--paper)" }} href={`${EXPLORER_BASE}/address/${config.factoryAddress}`} target="_blank" rel="noreferrer">
                查看 Factory 合约
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}