/**
 * Logo / Hero / 内容图挂载点
 * - 默认从 public/*.svg 加载（图片到位后把同名文件放进去即可，无需改组件）
 * - 图片加载失败时自动回退到内联 SVG 印记（保留编辑感）
 */
import { useState } from "react";

const FALLBACK_SVG = (
  <svg viewBox="0 0 240 188" role="img" aria-label="香蕉印记" style={{ width: "100%", height: "100%" }}>
    <g fill="none" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round">
      <path d="M 36 48 Q 60 142 152 158 Q 200 162 204 122 Q 208 76 168 50 Q 124 22 70 30 Q 44 34 36 48 Z" />
      <path d="M 64 70 Q 78 132 144 152" stroke="#b8924b" strokeWidth="0.8" />
      <line x1="36" y1="48" x2="48" y2="40" />
      <line x1="204" y1="122" x2="216" y2="128" />
    </g>
    <g fontFamily="Inter, sans-serif" fill="#0a0a0a" fontWeight="600">
      <text x="120" y="178" textAnchor="middle" fontSize="11" letterSpacing="3">
        GENUS · MUSA · №&nbsp;01
      </text>
    </g>
  </svg>
);

/** 项目主 Logo：用于导航 brand、favicon、详情页头 */
export function BananaLogo({ size = 28, src = "/logo.jpg" }: { size?: number; src?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return <BananaMark size={size} />;
  }
  return (
    <img
      src={src}
      alt="BANANA"
      width={size}
      height={size}
      onError={() => setErrored(true)}
      style={{ display: "block", flex: "none" }}
    />
  );
}

/** 首页 Hero 大图（替换票券区视觉焦点） */
export function BananaHero({ src = "/hero.jpg", alt = "最贵香蕉 $45,000,000" }: { src?: string; alt?: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div style={{ aspectRatio: "3/4", border: "1px solid var(--ink)", display: "grid", placeItems: "center", background: "var(--paper-2)" }}>
        <BananaArt size={200} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{
        display: "block",
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        maxHeight: "min(80vh, 640px)",
        objectFit: "cover",
        objectPosition: "center",
        aspectRatio: "4/5",
        border: "1px solid var(--ink)",
        marginInline: "auto",
      }}
    />
  );
}

/** 内容插图（生态宣言 / 概念 / CTA 之间的全宽图） */
export function BananaFigure({
  src = "/figure.jpg",
  alt = "BANANA 发射生态",
  aspect = "16/9",
  mobileAspect = "4/3",
}: {
  src?: string;
  alt?: string;
  aspect?: string;
  mobileAspect?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div style={{ aspectRatio: aspect, border: "1px solid var(--ink)", display: "grid", placeItems: "center", background: "var(--paper-2)" }}>
        <BananaArt size={160} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      style={{
        display: "block",
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        // 关键：移动端用更"方"的比例（窄屏不会变成一条线）
        aspectRatio: mobileAspect,
        // 双重保险：即使用户设备不支持 aspect-ratio，也不会失控
        maxHeight: "min(70vh, 560px)",
        objectFit: "cover",
        objectPosition: "center",
        border: "1px solid var(--ink)",
        // 把桌面端比例作为 CSS 变量，桌面端媒体查询用 var() 覆盖
        // @ts-expect-error CSS 变量不在标准 CSSProperties 类型里
        "--fig-aspect": aspect,
      }}
      className="fig-adaptive"
    />
  );
}

/** 极简香蕉印记 SVG（保留为兜底，导航图标也用它） */
export function BananaArt({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 240 188" role="img" aria-label="香蕉印记">
      <g fill="none" stroke="#0a0a0a" strokeWidth="1.4" strokeLinecap="round">
        <path d="M 36 48 Q 60 142 152 158 Q 200 162 204 122 Q 208 76 168 50 Q 124 22 70 30 Q 44 34 36 48 Z" />
        <path d="M 64 70 Q 78 132 144 152" stroke="#b8924b" strokeWidth="0.8" />
        <line x1="36" y1="48" x2="48" y2="40" />
        <line x1="204" y1="122" x2="216" y2="128" />
      </g>
      <g fontFamily="Inter, sans-serif" fill="#0a0a0a" fontWeight="600">
        <text x="120" y="178" textAnchor="middle" fontSize="11" letterSpacing="3">
          GENUS · MUSA · №&nbsp;01
        </text>
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
      />
    </svg>
  );
}