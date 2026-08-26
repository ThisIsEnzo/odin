"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Maximum translation in px, applied as the element crosses the viewport. */
  strength?: number;
};

/**
 * Deliberately not a GSAP/library dependency — package.json doesn't already
 * include one, and PHASE 3C §10 says not to add a dependency just for
 * decorative motion. This is a plain, passive, rAF-throttled scroll
 * listener that only ever writes `transform: translate3d(...)` (never a
 * layout property), per §12. Disabled outright below the `sm` breakpoint
 * and under `prefers-reduced-motion`, per §6/§9.
 *
 * PHASE 3E: `will-change: transform` is now only applied while the effect
 * is actually active (not on mobile/reduced-motion, where the listener
 * never attaches) — per §11, "only where genuinely useful," not globally.
 */
export function Parallax({ children, className, strength = 24 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmallScreen = window.matchMedia("(max-width: 639px)").matches;
    if (reduceMotion || isSmallScreen) return;

    node.style.willChange = "transform";

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      // -1 (element centered above viewport) .. 1 (element centered below viewport)
      const progress = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      const clamped = Math.max(-1, Math.min(1, progress));
      node.style.transform = `translate3d(0, ${(clamped * strength).toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      node.style.willChange = "";
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
