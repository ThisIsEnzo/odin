"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { OfferFacts } from "@/components/domain/booking/OfferFacts";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types/domain";
import { confirmedHours } from "@/lib/experience-hours";

const IMAGES: Record<string, { src: string; focus: string }> = {
  "horse-riding": { src: "/images/experiences/odin-horse.jpg", focus: "50% 35%" },
  "pony-riding": { src: "/images/experiences/odin-pony.jpg", focus: "50% 40%" },
  atv: { src: "/images/experiences/odin-atv.jpg", focus: "60% 45%" },
  sauna: { src: "/images/experiences/odin-sauna.jpg", focus: "55% 55%" },
};
const camel = (id: string) => id.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase());

export function ExperienceShowcase({ experiences }: { experiences: Experience[] }) {
  const [active, setActive] = useState(0);
  const t = useTranslations("experiences");
  const tc = useTranslations("experienceCard");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  if (experiences.length === 0) return null;

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = experiences.length - 1;
    let n: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") n = i === last ? 0 : i + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = i === 0 ? last : i - 1;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = last;
    if (n === null) return;
    e.preventDefault(); setActive(n); refs.current[n]?.focus();
  };

  return (
    <div className="exp-stage">
      <div role="tablist" aria-orientation="vertical" aria-label={t("horseRiding.title")} className="exp-rail">
        {experiences.map((x, i) => (
          <button key={x.id} ref={(el) => { refs.current[i] = el; }} role="tab" type="button"
            id={`exp-tab-${x.id}`} aria-selected={i === active} aria-controls={`exp-panel-${x.id}`}
            tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)}
            className={cn("exp-rail-item", i === active && "is-active")}>
            <span className="exp-rail-index" aria-hidden="true">0{i + 1}</span>
            <span className="exp-rail-name">{t(`${camel(x.id)}.title`)}</span>
          </button>
        ))}
      </div>
      <div className="exp-stage-right">
        {experiences.map((x, i) => {
          const img = IMAGES[x.id];
          const title = t(`${camel(x.id)}.title`);
          const hours = confirmedHours(x);
          return (
            <div key={x.id} id={`exp-panel-${x.id}`} role="tabpanel" aria-labelledby={`exp-tab-${x.id}`}
              hidden={i !== active} className="exp-panel">
              <div className="exp-media">
                {img ? <Image src={img.src} alt={title} fill priority={i === 0} sizes="(min-width:1024px) 62vw, 100vw" className="object-cover" style={{ objectPosition: img.focus }} /> : null}
              </div>
              <div className="exp-card">
                <p className="eyebrow exp-card-kicker">ON GROUND · EXPERIENCE 0{i + 1}</p>
                <h3 className="exp-card-title">{title}</h3>
                <p className="exp-card-desc">{t(`${camel(x.id)}.shortDescription`)}</p>
                <div className="exp-card-badges">
                  {hours ? <Badge variant="dusk">{tc("hours", { open: hours.open, close: hours.close })}</Badge> : null}
                  {x.restrictions.maxWeightKg ? <Badge variant="saddle">{tc("maxWeight", { max: x.restrictions.maxWeightKg })}</Badge> : null}
                </div>
                <OfferFacts experience={x} />
                <Link href={`/book?experience=${x.id}`} className={buttonVariants({ variant: "primary", size: "sm", className: "mt-4" })}>
                  {tc("bookCta")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
