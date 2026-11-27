"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { registerScrollItem, prefersReducedMotion } from "@/lib/motion";
type ScrollSceneProps = { children: ReactNode; className?: string; height?: string };
export function ScrollScene({ children, className, height = "180vh" }: ScrollSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null), frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = trackRef.current, frame = frameRef.current;
    if (!track || !frame) return;
    if (prefersReducedMotion()) { frame.style.setProperty("--scene-progress", "0"); return; }
    const unsubscribe = registerScrollItem(track, (_progress, rect) => {
      const vh = window.innerHeight || 1, total = rect.height - vh;
      const passed = Math.max(0, Math.min(total, -rect.top));
      frame.style.setProperty("--scene-progress", total > 0 ? (passed / total).toFixed(4) : "0");
    });
    return unsubscribe;
  }, []);
  return <div ref={trackRef} className={cn("scroll-scene", className)} style={{ height }}><div ref={frameRef} className="scroll-scene-frame">{children}</div></div>;
}
