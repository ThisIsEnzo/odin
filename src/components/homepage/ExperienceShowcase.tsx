"use client";

import { useState } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types/domain";

type ExperienceShowcaseProps = {
  experiences: Experience[];
};

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * PHASE 3D: presentation-only image mapping keyed by the existing
 * `Experience.id` from src/data/odin/experiences.ts. This lives here in the
 * component, not in the data layer or translation files — it's a rendering
 * concern (which asset to show), not a business fact, so it doesn't
 * duplicate or modify anything in src/data/odin/*. `focus` is a CSS
 * object-position tuned per photo so the rider/animal stays in frame across
 * the panel's aspect ratio. An id with no entry here simply renders no
 * image (falls back to the plain surface) rather than guessing a path.
 */
const experienceImages: Partial<Record<string, { src: string; focus: string }>> = {
  "horse-riding": { src: "/images/experiences/odin-horse.jpg", focus: "50% 35%" },
  "pony-riding": { src: "/images/experiences/odin-pony.jpg", focus: "50% 40%" },
  atv: { src: "/images/experiences/odin-atv.jpg", focus: "60% 45%" },
  sauna: { src: "/images/experiences/odin-sauna.jpg", focus: "55% 55%" },
};

/**
 * PHASE 3C §2: one dominant content area + four selectable items, crossfading
 * on selection, instead of four identical static cards. `experiences` is
 * passed in as a prop by the server component page.tsx — this file never
 * imports from src/data/odin itself, so there is exactly one place the list
 * is read from, and no business data (hours, weight, price) is duplicated
 * or invented here. The crossfade is a plain CSS opacity transition between
 * stacked panels — no animation dependency.
 */
export function ExperienceShowcase({ experiences }: ExperienceShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tExperiences = useTranslations("experiences");
  const tExperienceCard = useTranslations("experienceCard");
  const tPricing = useTranslations("pricing");
  const format = useFormatter();

  if (experiences.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[220px_1fr] lg:items-stretch lg:gap-8">
      {/* Selector — horizontal snap-scroll row on mobile (touch-friendly,
          no tiny targets), vertical list on desktop. */}
      <div
        role="tablist"
        className={cn(
          "flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide",
          "lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0 lg:snap-none",
        )}
      >
        {experiences.map((experience, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={experience.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "shrink-0 snap-start rounded-button border px-4 py-3.5 text-left text-sm font-medium",
                "transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
                isActive
                  ? "border-moss bg-moss text-canvas"
                  : "border-ink/15 bg-transparent text-ink/70 hover:border-moss/40 hover:text-ink",
              )}
            >
              {tExperiences(`${toCamelCase(experience.id)}.title`)}
            </button>
          );
        })}
      </div>

      {/* Content panel — stacked absolutely, crossfading via opacity only.
          Each slide is now a full-bleed photo with a bottom scrim and the
          text/badges sitting in light (canvas) type over it, rather than a
          plain surface — a deliberately different treatment from the
          Hero's frosted card, for visual rhythm across the page. */}
      <div className="relative min-h-[360px] overflow-hidden rounded-card border border-moss/15 bg-white/50 sm:min-h-[300px]">
        {experiences.map((experience, index) => {
          const isActive = index === activeIndex;
          const maxWeight = experience.restrictions.maxWeightKg;
          const image = experienceImages[experience.id];
          const title = tExperiences(`${toCamelCase(experience.id)}.title`);

          return (
            <div
              key={experience.id}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-out",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {image ? (
                <>
                  <Image
                    src={image.src}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: image.focus }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
                </>
              ) : null}

              <div
                className={cn(
                  "relative flex h-full flex-col justify-end p-6 sm:p-8",
                  image ? "text-canvas" : "justify-between text-ink",
                )}
              >
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl">{title}</h3>
                  <p className={cn("mt-3 max-w-md", image ? "text-canvas/85" : "text-ink/70")}>
                    {tExperiences(`${toCamelCase(experience.id)}.shortDescription`)}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={image ? "border-canvas/40 bg-transparent text-canvas" : undefined}
                  >
                    {tExperienceCard("hours", {
                      open: experience.operatingHours.open,
                      close: experience.operatingHours.close,
                    })}
                  </Badge>
                  {maxWeight ? (
                    <Badge variant="saddle">{tExperienceCard("maxWeight", { max: maxWeight })}</Badge>
                  ) : null}
                  <span className={cn("text-sm", image ? "text-canvas/80" : "text-ink/60")}>
                    {tExperienceCard("priceFrom", {
                      amount: format.number(experience.price.amount),
                      currency: experience.price.currency,
                    })}{" "}
                    {tPricing(`unit.${experience.price.unit}`)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
