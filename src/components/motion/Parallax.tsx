"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerScrollItem, isTouchLayout } from "@/lib/motion";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

type ParallaxProps = {
  children: ReactNode; className?: string; strength?: number; speed?: number; scale?: number; enableOnMobile?: boolean;
};

export function Parallax({ children, className, strength = 24, speed, scale = 0, enableOnMobile = false }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const travel = speed ?? strength;
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || (!enableOnMobile && isTouchLayout())) return;
    node.style.willChange = "transform";
    const unsubscribe = registerScrollItem(node, (progress) => {
      const offset = (progress - 0.5) * travel;
      const zoom = 1 + progress * scale;
      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(${zoom.toFixed(4)})`;
    });
    return () => { unsubscribe(); node.style.willChange = ""; node.style.transform = ""; };
  }, [travel, scale, enableOnMobile, reduced]);
  return <div ref={ref} className={className}>{children}</div>;
}
