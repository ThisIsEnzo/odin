"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Parallax } from "@/components/motion/Parallax";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types/domain";

type ExperienceShowcaseProps = {
  experiences: Experience[];
};

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}


const experienceImages: Partial<Record<string, { src: string; focus: string }>> = {
  "horse-riding": { src: "/images/experiences/odin-horse.jpg", focus: "50% 35%" },
  "pony-riding": { src: "/images/experiences/odin-pony.jpg", focus: "50% 40%" },
  atv: { src: "/images/experiences/odin-atv.jpg", focus: "60% 45%" },
  sauna: { src: "/images/experiences/odin-sauna.jpg", focus: "55% 55%" },
};


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
    <>
      
      <div className="hidden gap-3 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-stretch lg:gap-8">
      
      <div
        aria-label={tExperienceCard("bookCta")}
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
              aria-controls={`desktop-experience-${experience.id}`}
              aria-pressed={isActive}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "flex items-center gap-4 shrink-0 border-b px-0 py-6 text-left text-xl font-medium",
                "transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
                isActive
                  ? "border-brand-primary text-brand-primary"
                  : "border-ink/15 text-ink/60 hover:text-ink",
              )}
            >
              <span aria-hidden="true" className="text-xs opacity-60">0{index + 1}</span>{tExperiences(`${toCamelCase(experience.id)}.title`)}
            </button>
          );
        })}
      </div>

      
      <div className="surface-inverse relative min-h-[560px] xl:min-h-[600px] overflow-hidden bg-surface-dark">
        {experiences.map((experience, index) => {
          const isActive = index === activeIndex;
          const maxWeight = experience.restrictions.maxWeightKg;
          const image = experienceImages[experience.id];
          const title = tExperiences(`${toCamelCase(experience.id)}.title`);

          return (
            <div
              key={experience.id}
              id={`desktop-experience-${experience.id}`}
              aria-hidden={!isActive} inert={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-[600ms] ease-out",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              {image ? (
                <>
                  <Parallax strength={20} className="absolute -inset-4">
                    <Image
                      src={image.src}
                      alt={title}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover"
                      style={{ objectPosition: image.focus }}
                    />
                  </Parallax>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
                </>
              ) : null}

              <div
                className={cn(
                  "relative flex h-full flex-col justify-end p-6 sm:p-10",
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
                    {experience.mock.price.isMock ? tExperienceCard("pricePending") : <>{tExperienceCard("priceFrom", {amount:format.number(experience.price.amount),currency:experience.price.currency})} {tPricing(`unit.${experience.price.unit}`)}</>}
                  </span>
                </div>

                <Link
                  href={`/book?experience=${experience.id}`}
                  className={buttonVariants({
                    variant: "primary",
                    size: "sm",
                    className: "mt-5 self-start",
                  })}
                >
                  {tExperienceCard("bookCta")}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      
      <div className="lg:hidden">
        <div className="flex flex-col gap-2">
          {experiences.map((experience, index) => {
            const isActive = index === activeIndex;
            const maxWeight = experience.restrictions.maxWeightKg;
            const image = experienceImages[experience.id];
            const title = tExperiences(`${toCamelCase(experience.id)}.title`);
            const headerId = `experience-tab-${experience.id}`;
            const panelId = `experience-panel-${experience.id}`;

            return (
              <div
                key={experience.id}
                // The selected experience uses the shared accessible brand accent.
                className={cn(
                  "overflow-hidden border-t transition-colors duration-200",
                  isActive ? "border-brand-primary bg-canvas-soft" : "border-ink/10 bg-transparent",
                )}
              >
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-5 text-left",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-xl",
                      isActive ? "text-ink" : "text-ink/70",
                    )}
                  >
                    <span aria-hidden="true" className="mr-4 text-xs opacity-50">0{index + 1}</span>{title}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 shrink-0 text-ink/50 transition-transform duration-300",
                      isActive && "rotate-180",
                    )}
                  />
                </button>

                
                <div
                  id={panelId}
                  role="region"
                  inert={!isActive} aria-hidden={!isActive}
                  aria-labelledby={headerId}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4">
                      {image ? (
                        <div className="relative mb-4 aspect-[5/6] sm:aspect-[4/3] w-full overflow-hidden rounded-button">
                          <Image
                            src={image.src}
                            alt={title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            style={{ objectPosition: image.focus }}
                          />
                        </div>
                      ) : null}

                      <p className="text-sm text-ink/70">
                        {tExperiences(`${toCamelCase(experience.id)}.shortDescription`)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {tExperienceCard("hours", {
                            open: experience.operatingHours.open,
                            close: experience.operatingHours.close,
                          })}
                        </Badge>
                        {maxWeight ? (
                          <Badge variant="saddle">
                            {tExperienceCard("maxWeight", { max: maxWeight })}
                          </Badge>
                        ) : null}
                        <span className="text-sm text-ink/60">
                          {experience.mock.price.isMock ? tExperienceCard("pricePending") : <>{tExperienceCard("priceFrom", {amount:format.number(experience.price.amount),currency:experience.price.currency})} {tPricing(`unit.${experience.price.unit}`)}</>}
                        </span>
                      </div>

                      <Link
                        href={`/book?experience=${experience.id}`}
                        className={buttonVariants({
                          variant: "primary",
                          size: "sm",
                          className: "mt-4 w-full",
                        })}
                      >
                        {tExperienceCard("bookCta")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
