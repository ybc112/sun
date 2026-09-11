/** 极简香蕉印记 SVG —— 印刷感，无胶带无贴纸 */
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