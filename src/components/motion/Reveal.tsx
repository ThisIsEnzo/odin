"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms — for card/pillar sequences, not per-element noise. */
  delayMs?: number;
};

/**
 * One shared reveal mechanism for the whole homepage (opacity + translateY),
 * triggered once via IntersectionObserver and left revealed thereafter —
 * per PHASE 3C §5 ("use one coherent motion system", not per-element
 * animation). `prefers-reduced-motion` is honored two ways: explicitly here
 * (skips the observer, renders already-visible) and defensively via the
 * global `@media (prefers-reduced-motion: reduce)` block in globals.css,
 * which neutralizes the underlying CSS transition regardless.
 */
export function Reveal({ children, className, delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined = delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;

  return (
    <div ref={ref} className={cn("reveal", visible && "reveal-visible", className)} style={style}>
      {children}
    </div>
  );
}
