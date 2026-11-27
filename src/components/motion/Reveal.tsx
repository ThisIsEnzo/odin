"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "scale" | "left" | "right" | "mask";
type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  variant?: RevealVariant;
};

/**
 * Progressive-enhancement reveal.
 *
 * The server-rendered content is visible by default. Motion is armed only
 * after mount and only when reduced motion is not requested. Elements already
 * in or near the viewport reveal immediately; other elements use
 * IntersectionObserver, with a finite fallback so a failed observer or a
 * no-scroll/full-page capture can never leave content hidden indefinitely.
 */
export function Reveal({ children, className, delayMs = 0, variant = "up" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);

    let disposed = false;
    let observer: IntersectionObserver | undefined;
    let fallbackTimer: number | undefined;

    const reveal = () => {
      if (disposed) return;
      setVisible(true);
      if (fallbackTimer !== undefined) {
        window.clearTimeout(fallbackTimer);
        fallbackTimer = undefined;
      }
      observer?.disconnect();
    };

    const rect = node.getBoundingClientRect();
    const isNearViewport = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;

    if (isNearViewport) {
      setVisible(true);
      return () => {
        disposed = true;
      };
    }

    // Start the safety net before creating the observer: even a constructor or
    // observe() failure must not strand a hidden section.
    fallbackTimer = window.setTimeout(reveal, 900);

    if (typeof IntersectionObserver === "undefined") {
      reveal();
    } else {
      try {
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) reveal();
          },
          { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        );
        observer.observe(node);
      } catch {
        reveal();
      }
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
    };
  }, []);

  const style: CSSProperties | undefined = armed && delayMs
    ? { transitionDelay: `${delayMs}ms` }
    : undefined;
  const variantClass = variant === "up" ? undefined : `reveal-${variant}`;

  return (
    <div
      ref={ref}
      className={cn(
        className,
        armed && "reveal",
        armed && variantClass,
        armed && visible && "reveal-visible",
      )}
      style={style}
    >
      {children}
    </div>
  );
}
