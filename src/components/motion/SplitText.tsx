"use client";
import { Fragment, createElement, useEffect, useRef, useState, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { MOTION } from "@/lib/motion";
type SplitTextProps = { text: string; as?: ElementType; className?: string; delayMs?: number; stagger?: number };
export function SplitText({ text, as = "span", className, delayMs = 0, stagger = MOTION.stagger.word }: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false), [visible, setVisible] = useState(false);
  const words = text.split(" ");
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const children = words.map((word, index) => <Fragment key={`${word}-${index}`}>{index ? " " : null}<span className="split-word" style={armed ? { transitionDelay: `${delayMs + index * stagger}ms` } : undefined}>{word}</span></Fragment>);
  return createElement(as, { ref, className: cn("split-text", armed && "split-armed", armed && visible && "split-visible", className) }, children);
}
