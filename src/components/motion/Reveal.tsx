"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "left" | "right" | "mask";
type RevealProps = { children: ReactNode; className?: string; delayMs?: number; variant?: RevealVariant };

export function Reveal({ children, className, delayMs = 0, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const style: CSSProperties | undefined = armed && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;
  const variantClass = variant === "up" ? undefined : `reveal-${variant}`;
  return <div ref={ref} className={cn(className, armed && "reveal", armed && variantClass, armed && visible && "reveal-visible")} style={style}>{children}</div>;
}
