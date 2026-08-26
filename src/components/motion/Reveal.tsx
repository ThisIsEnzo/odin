"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger offset in ms — for card/pillar sequences, not per-element noise. */
  delayMs?: number;
  /**
   * "up" (default): fade + translateY — the sitewide default.
   * "scale": fade + translateY + a slight scale-in — used for photographs
   * (Gallery) entering the frame, per this phase's spec.
   * "left" / "right": fade + translateX from the given side — used for
   * opposing-motion compositions (Restaurant image/card, Why ODIN's two
   * columns) coming together, per this phase's spec.
   * Still one mechanism (IntersectionObserver + CSS transition), just
   * parameterized — not a second motion system.
   */
  variant?: RevealVariant;
};

/**
 * One shared reveal mechanism for the whole homepage (opacity + transform),
 * triggered once via IntersectionObserver and left revealed thereafter —
 * per PHASE 3C §5 ("use one coherent motion system", not per-element
 * animation). `prefers-reduced-motion` is honored two ways: explicitly here
 * (skips the observer, renders already-visible) and defensively via the
 * global `@media (prefers-reduced-motion: reduce)` block in globals.css,
 * which neutralizes the underlying CSS transition regardless.
 *
 * PHASE — CINEMATIC MOTION REFINEMENT: trigger tuned to this phase's
 * explicit spec ("once when ~15–25% of the element enters the viewport") —
 * threshold 0.2, with a small negative rootMargin (the conventional way to
 * implement that literally: wait until the element is genuinely that
 * visible in the real viewport, not pre-emptively before the fold).
 */
export function Reveal({ children, className, delayMs = 0, variant = "up" }: RevealProps) {
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
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined = delayMs ? { transitionDelay: `${delayMs}ms` } : undefined;
  const variantClass = variant === "up" ? "" : `reveal-${variant}`;

  return (
    <div
      ref={ref}
      className={cn("reveal", variantClass, visible && "reveal-visible", className)}
      style={style}
    >
      {children}
    </div>
  );
}