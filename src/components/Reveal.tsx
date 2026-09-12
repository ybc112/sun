import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * 滚动入场包装：进入视口时添加 .in 类，触发淡入上移动画。
 * 通过 IntersectionObserver 实现，不依赖任何库。
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${delay ? `d${Math.min(delay, 8)}` : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}