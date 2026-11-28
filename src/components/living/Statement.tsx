"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

/** Words transition from muted to ink as the statement enters the viewport.
 *  Without JS and with reduced motion, the text is visible immediately. */
export function Statement() {
  const t = useTranslations("home");
  const ref = useRef<HTMLParagraphElement>(null);
  const [armed, setArmed] = useState(false);
  const [on, setOn] = useState(false);
  const words = t("statement").split(" ");

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    if (typeof IntersectionObserver === "undefined") { setOn(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.3 },
    );
    io.observe(node);
    const fallback = window.setTimeout(() => setOn(true), 1400);
    return () => { io.disconnect(); window.clearTimeout(fallback); };
  }, []);

  const cls = ["st-p", armed ? "armed" : "", armed && on ? "on" : ""].filter(Boolean).join(" ");

  return (
    <section className="st">
      <div className="le-wrap">
        <p ref={ref} className={cls}>
          {words.map((word, i) => (
            <span key={`${word}-${i}`} className="w" style={armed ? { transitionDelay: `${i * 65}ms` } : undefined}>
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
