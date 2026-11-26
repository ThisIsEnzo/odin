"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms — for card/pillar sequences, not per-element noise. */
  delayMs?: number;
  variant?: RevealVariant;
};

/**
 * One shared reveal mechanism (opacity + transform), triggered once via
 * IntersectionObserver. Progressive enhancement: the server renders content
 * fully visible (no hiding class), and the hidden/reveal state is only armed
 * after mount when motion is allowed — so with JS disabled or failed, nothing
 * stays invisible. `prefers-reduced-motion` skips arming entirely.
 */
export function Reveal({ children, className, delayMs = 0, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined = armed && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;
  const variantClass = variant === "up" ? undefined : `reveal-${variant}`;

  return (
    <div
      ref={ref}
      className={cn(className, armed && "reveal", armed && variantClass, armed && visible && "reveal-visible")}
      style={style}
    >
      {children}
    </div>
  );
}
