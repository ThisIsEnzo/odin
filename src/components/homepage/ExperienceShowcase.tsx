"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { OfferFacts } from "@/components/domain/booking/OfferFacts";
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
  const tHome = useTranslations("home");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (experiences.length === 0) return null;

  const activeExperience = experiences[activeIndex] ?? experiences[0];
  const activeKey = toCamelCase(activeExperience.id);
  const activeImage = experienceImages[activeExperience.id];
  const activeTitle = tExperiences(activeKey + ".title");
  const activeMaxWeight = activeExperience.restrictions.maxWeightKg;

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = experiences.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="exp-stage">
      <div
        role="tablist"
        aria-label={tHome("experiencesHeading")}
        aria-orientation="vertical"
        className="exp-rail"
      >
        {experiences.map((experience, index) => {
          const isActive = index === activeIndex;
          const title = tExperiences(toCamelCase(experience.id) + ".title");

          return (
            <button
              key={experience.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={"exp-tab-" + experience.id}
              role="tab"
              type="button"
              aria-controls={"exp-panel-" + experience.id}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn("exp-rail-item", isActive && "is-active")}
            >
              <span className="exp-rail-index" aria-hidden="true">0{index + 1}</span>
              <span className="exp-rail-name">{title}</span>
              <span className="exp-rail-arrow" aria-hidden="true">↗</span>
            </button>
          );
        })}
      </div>

      <div className="exp-stage-right">
        <div
          key={activeExperience.id}
          id={"exp-panel-" + activeExperience.id}
          role="tabpanel"
          aria-labelledby={"exp-tab-" + activeExperience.id}
          tabIndex={0}
          className="exp-panel"
        >
          <div className="exp-media">
            {activeImage ? (
              <Parallax strength={20} scale={0.04} className="absolute -inset-4">
                <Image
                  src={activeImage.src}
                  alt={activeTitle}
                  fill
                  priority
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: activeImage.focus }}
                />
              </Parallax>
            ) : null}
            <div className="exp-media-shade" aria-hidden="true" />
            <span className="exp-media-index" aria-hidden="true">
              0{activeIndex + 1} <span>/ 0{experiences.length}</span>
            </span>
          </div>

          <article className="exp-card">
            <p className="eyebrow exp-card-kicker">ON GROUND · EXPERIENCE {String(activeIndex + 1).padStart(2, "0")}</p>
            <h3 className="exp-card-title">{activeTitle}</h3>
            <p className="exp-card-desc">
              {tExperiences(activeKey + ".shortDescription")}
            </p>
            <div className="exp-card-badges">
              <Badge variant="dusk">
                {tExperienceCard("hours", {
                  open: activeExperience.operatingHours.open,
                  close: activeExperience.operatingHours.close,
                })}
              </Badge>
              {activeMaxWeight !== undefined ? (
                <Badge variant="saddle">
                  {tExperienceCard("maxWeight", { max: activeMaxWeight })}
                </Badge>
              ) : null}
            </div>
            <OfferFacts experience={activeExperience} />
            <Link
              href={"/book?experience=" + activeExperience.id}
              className={buttonVariants({
                variant: "primary",
                size: "sm",
                className: "mt-5",
              })}
            >
              {tExperienceCard("bookCta")} <span aria-hidden="true">↗</span>
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
}
