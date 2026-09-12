/** 极简线框 SVG（不卖萌不卡通） */
import { useState } from "react";

export function BananaArt({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 240 188" role="img" aria-label="香蕉印记">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".9">
        <path d="M 36 48 Q 60 142 152 158 Q 200 162 204 122 Q 208 76 168 50 Q 124 22 70 30 Q 44 34 36 48 Z" />
        <path d="M 64 70 Q 78 132 144 152" opacity=".4" />
        <line x1="36" y1="48" x2="48" y2="40" />
        <line x1="204" y1="122" x2="216" y2="128" />
      </g>
    </svg>
  );
}

export function BananaMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M 5 6 Q 7 16 15 18 Q 20 19 20 14 Q 20 9 14 7 Q 8 5 5 6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Logo（导航用）：金色描边香蕉 + 文字标记 */
export function BananaLogo({ size = 28, src = "/logo.jpg" }: { size?: number; src?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        style={{
          width: size,
          height: size,
          border: "1px solid var(--gold)",
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: "var(--gold-bright)",
        }}
        aria-label="BANANA"
      >
        <BananaMark size={size * 0.6} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="BANANA"
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{ display: "block", flex: "none", borderRadius: 2 }}
    />
  );
}

/** 首页 Hero 图占位：金色极简线框香蕉 + 数字压印（保留 logo 图片 + 兜底 SVG） */
export function BananaHero({ src = "/hero.jpg", alt = "最贵香蕉 $45,000,000" }: { src?: string; alt?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          background: "linear-gradient(180deg, var(--ink-2), var(--ink))",
          border: "1px solid var(--line-strong)",
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          color: "var(--gold-bright)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <BananaArt size={180} />
        <div style={{ position: "absolute", bottom: 20, left: 24, right: 24, display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--paper-3)" }}>
          <span>NO. 01 / BANANA</span>
          <span>EST. 2019</span>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{ display: "block", width: "100%", height: "auto", border: "1px solid var(--line-strong)", borderRadius: 2 }}
    />
  );
}

/** 生态宣言插图（按原图比例显示） */
export function BananaFigure({ src = "/figure.jpg", alt = "BANANA 发射生态" }: { src?: string; alt?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          background: "var(--ink-2)",
          border: "1px solid var(--line-strong)",
          display: "grid",
          placeItems: "center",
          color: "var(--gold-bright)",
        }}
      >
        <BananaArt size={140} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{ display: "block", width: "100%", height: "auto", border: "1px solid var(--line-strong)", borderRadius: 2 }}
    />
  );
}