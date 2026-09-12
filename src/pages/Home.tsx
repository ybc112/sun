import { Link } from "react-router-dom";
import { BananaHero, BananaFigure } from "../components/BananaArt";
import { Reveal } from "../components/Reveal";
import { SectionTitle, Ticker } from "../components/ui";
import { CONCEPTS, MECHANISMS } from "../lib/concepts";
import { config, EXPLORER_BASE } from "../config";

const TICKER = [
  "BANANA 发射台强势启航",
  "多元叙事 × 多概念融合 × 多机制玩法",
  "多位币圈大佬 · 知名人士赞助助力",
  "社区矩阵同步宣发 · 开盘热度拉满",
  "最贵香蕉 $45,000,000 成交",
  "地址后缀 0x7777 靓号铸造",
  "24 小时退款险 · 持币自动分红",
  "售罄 LP 永久锁死黑洞 · 合约自动开源验证",
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
    season: "上链",
    title: "话题与流量，今天全部带到链上",
    body: "一根香蕉，曾经因为天价艺术品交易轰动全球；今天，BANANA 把这根香蕉的话题与流量带上链——任何人一键发射自己的标的。",
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

/** 旋转印章：杂志压印感圆环文字 */
function Stamp() {
  return (
    <svg className="stamp-spin" viewBox="0 0 120 120" style={{ position: "absolute", bottom: -30, left: -30, opacity: 0.7, pointerEvents: "none" }} aria-hidden="true">
      <defs>
        <path id="stamp-circle" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" fill="none" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="none" stroke="var(--gold-deep)" strokeWidth="0.75" strokeDasharray="2 3" />
      <text style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".18em", fill: "var(--gold-deep)", textTransform: "uppercase" }}>
        <textPath href="#stamp-circle">
          BANANA MINT · EST. 2019 · GOLD STANDARD · MMXXVI ·
        </textPath>
      </text>
      <text x="60" y="66" textAnchor="middle" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15, fill: "var(--ink)" }}>
        ①
      </text>
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <Ticker items={TICKER} />

      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow hero-anim hero-anim-1">
                <span>BANANA LAUNCHPAD</span>
                <span>强势启航</span>
              </div>
              <h1 className="hero-anim hero-anim-2">
                话题与流量，
                <span className="price">上链</span>
              </h1>
              <p className="hero-lede hero-anim hero-anim-3">
                一根香蕉，曾经因为天价艺术品交易轰动全球；
                今天，BANANA 把这份话题和流量带到链上。
              </p>
              <div className="flex gap-12 hero-anim hero-anim-4" style={{ marginTop: 28, flexWrap: "wrap" }}>
                <span className="tag tag-solid">多元叙事</span>
                <span className="tag tag-solid">多概念融合</span>
                <span className="tag tag-solid">多机制玩法</span>
              </div>
              <p className="serif hero-anim hero-anim-4" style={{ color: "var(--muted)", fontSize: 15, marginTop: 18, maxWidth: 540 }}>
                多位币圈大佬、知名人士赞助助力；社区矩阵同步宣发，开盘热度全面拉满。
              </p>
              <div className="flex gap-12 hero-anim hero-anim-5" style={{ marginTop: 36 }}>
                <Link to="/launch" className="btn btn-primary">立即发射 <span className="arr">→</span></Link>
                <Link to="/projects" className="btn">浏览项目 <span className="arr">→</span></Link>
              </div>
              <div className="hero-meta hero-anim hero-anim-6">
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

            <aside className="hero-anim hero-anim-3" style={{ position: "relative" }}>
              <Stamp />
              <BananaHero />
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
                <span>NO. 01 / BANANA</span>
                <span>EST. 2019</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== 生态宣言 ===== */}
      <section className="section" style={{ paddingBlock: "72px" }}>
        <div className="container">
          <Reveal as="div">
            <div style={{ maxWidth: 900 }}>
              <div className="kicker" style={{ marginBottom: 24 }}>OUR ECOSYSTEM</div>
              <h2 className="gold-rule" style={{ fontSize: "clamp(34px, 5vw, 64px)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
                别人做的是一个项目，
                <br />
                BANANA 要做的是一个
                <span className="serif goldline" style={{ color: "var(--gold-deep)" }}>持续出新标的</span>的发射生态。
              </h2>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <div style={{ marginTop: 48 }}>
              <BananaFigure />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== 香蕉传奇时间线 ===== */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionTitle
              number="§ 01 — The Legend"
              title={<>从 $6,200,000<br />到 $45,000,000</>}
              intro="一段关于「一根香蕉如何成为全球最贵 meme」的叙事，现在是你的项目入场券。"
            />
          </Reveal>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.year} delay={i % 3} as="div">
                <div className="tl-row">
                  <div className="tl-year">
                    {item.year}
                    <small>{item.season}</small>
                  </div>
                  <div className="tl-body">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 声援墙 ===== */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionTitle
              number="§ 02 — Sponsors"
              title={<>币圈大佬<br />都在聊的香蕉</>}
              intro="多位币圈大佬、知名人士赞助助力。以下为概念包装与致敬表达，非真实代言。"
            />
          </Reveal>
          <div className="voices">
            {VOICES.map((v, i) => (
              <Reveal key={v.name} delay={i % 2} as="div">
                <div className="voice">
                  <div className="voice-attr">
                    <span className="voice-name">{v.name}</span>
                    <span className="voice-role">{v.role}</span>
                  </div>
                  <p className="voice-quote">{v.quote}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 概念 ===== */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionTitle
              number="§ 03 — Concepts"
              title={<>多元叙事<br />多概念融合</>}
              intro="多元叙事 × 多概念融合 × 多机制玩法。每个概念对应链上独立的 templateId，概念即身份，上链即认证。"
            />
          </Reveal>
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
                <span className="concept-arrow" style={{ transition: "transform .25s" }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 机制 ===== */}
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionTitle
              number="§ 04 — Mechanism"
              title={<>多机制玩法，<br />拒绝千篇一律</>}
              intro="从自动做市到 24 小时退款险，从持币分红到通缩燃烧，按你的叙事自由装配。"
            />
          </Reveal>
          <div className="mech-list">
            {MECHANISMS.map((m, i) => (
              <Reveal key={m.key} delay={i % 4} as="div">
                <div className="mech-item">
                  <span className="mech-no">{String(i + 1).padStart(2, "0")} /</span>
                  <div>
                    <div className="mech-name">{m.title}</div>
                    <div className="mech-desc">{m.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section" style={{ background: "var(--ink)", color: "var(--paper)", borderBottom: 0 }}>
        <div className="container">
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 80, alignItems: "end" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold-bright)" }}>
                  § 05 — The Launch
                </div>
                <h2 style={{ marginTop: 14, color: "var(--paper)" }}>
                  香蕉不缺话题，<br />
                  <span className="serif goldline" style={{ color: "var(--gold-bright)" }}>BANANA 更不缺故事</span>
                </h2>
                <p className="hero-lede" style={{ color: "var(--paper-3)" }}>
                  首发开盘，市场见真章。
                  社区矩阵同步宣发，开盘热度全面拉满——现在就来发射你的第一根香蕉。
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
                <Link to="/launch" className="btn btn-gold" style={{ background: "var(--gold)", borderColor: "var(--gold)", color: "var(--ink)" }}>
                  开始发射 <span className="arr">→</span>
                </Link>
                <a className="btn" style={{ color: "var(--paper)", borderColor: "var(--paper)" }} href={`${EXPLORER_BASE}/address/${config.factoryAddress}`} target="_blank" rel="noreferrer">
                  查看 Factory 合约 <span className="arr">→</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}