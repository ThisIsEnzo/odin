"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

export function Statement() {
  const t = useTranslations("home");
  const locale = useLocale();
  const ref = useRef<HTMLParagraphElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  const text = t("statement");
  const segments = locale.startsWith("th") || locale.startsWith("zh")
    ? [text]
    : text.trim().split(/\s+/);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    if (typeof IntersectionObserver === "undefined") {
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
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [text]);

  return (
    <section className="st" aria-label={text}>
      <div className="le-wrap">
        <p
          ref={ref}
          className={"st-p" + (armed ? " armed" : "") + (armed && visible ? " on" : "")}
        >
          {segments.map((segment, index) => (
            <Fragment key={index}>
              {index > 0 && segments.length > 1 ? " " : null}
              <span
                className="w"
                style={armed ? { transitionDelay: Math.min(index * 55, 660) + "ms" } : undefined}
              >
                {segment}
              </span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
