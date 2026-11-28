"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Experience } from "@/types/domain";
import { offerPrice, confirmedHours, durationLabel } from "@/lib/offer";

const CROP: Record<string, string> = {
  "horse-riding": "50% 35%",
  "pony-riding": "50% 40%",
  atv: "60% 45%",
  sauna: "55% 55%",
};
const camel = (id: string) => id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

export function Experiences({ items }: { items: Experience[] }) {
  const [active, setActive] = useState(0);
  const [verticalTabs, setVerticalTabs] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const home = useTranslations("home");
  const t = useTranslations("experiences");
  const tc = useTranslations("experienceCard");
  const pricing = useTranslations("pricing");
  const bookingPricing = useTranslations("booking.pricing");
  const format = useFormatter();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setVerticalTabs(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!items.length) return null;

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    let next: number | null = null;

    if (verticalTabs && event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (verticalTabs && event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (!verticalTabs && event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (!verticalTabs && event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <section id="experiences" className="le-exp" aria-labelledby="le-exp-title">
      <div className="le-wrap">
        <div className="le-exp-head">
          <p className="le-note">01</p>
          <h2 id="le-exp-title" className="le-display le-exp-title">{home("experiencesHeading")}</h2>
          <p className="le-body">{home("experiencesIntro")}</p>
        </div>

        <div className="le-exp-grid">
          <div
            role="tablist"
            aria-orientation={verticalTabs ? "vertical" : "horizontal"}
            aria-label={home("experiencesHeading")}
            className="le-tabs"
          >
            {items.map((experience, index) => (
              <button
                key={experience.id}
                ref={(element) => { refs.current[index] = element; }}
                type="button"
                role="tab"
                id={`le-tab-${experience.id}`}
                aria-selected={index === active}
                aria-controls={`le-panel-${experience.id}`}
                tabIndex={index === active ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKey(event, index)}
                className="le-tab"
              >
                <i aria-hidden="true">0{index + 1}</i>
                <span>{t(`${camel(experience.id)}.title`)}</span>
              </button>
            ))}
          </div>

          <div className="le-exp-panels">
            {items.map((experience, index) => {
              const price = offerPrice(experience);
              const hours = confirmedHours(experience);
              const durations = durationLabel(experience);
              const title = t(`${camel(experience.id)}.title`);
              return (
                <div
                  key={experience.id}
                  id={`le-panel-${experience.id}`}
                  role="tabpanel"
                  aria-labelledby={`le-tab-${experience.id}`}
                  hidden={index !== active}
                  className="le-panel"
                >
                  <div className="le-shot">
                    <Image
                      src={experience.bookingImage ?? "/images/gallery/odin-gallery-01.jpg"}
                      alt={title}
                      fill
                      priority={index === 0}
                      sizes="(min-width:1024px) 62vw, 100vw"
                      style={{ objectPosition: CROP[experience.id] ?? "center" }}
                    />
                  </div>

                  <article className="le-plate">
                    <p className="le-note">ON GROUND · EXPERIENCE 0{index + 1}</p>
                    <h3>{title}</h3>
                    <p className="le-body">{t(`${camel(experience.id)}.shortDescription`)}</p>

                    <div className="le-chips">
                      {hours ? <span className="le-chip">{tc("hours", { open: hours.open, close: hours.close })}</span> : null}
                      {experience.restrictions.maxWeightKg ? (
                        <span className="le-chip">{tc("maxWeight", { max: experience.restrictions.maxWeightKg })}</span>
                      ) : null}
                    </div>

                    <dl className="le-facts">
                      <div>
                        <dt>{bookingPricing("duration")}</dt>
                        <dd>
                          {durations.length
                            ? durations.map((minutes) => bookingPricing("minutes", { count: minutes })).join(" / ")
                            : bookingPricing("durationPending")}
                        </dd>
                      </div>
                      <div className="le-price-fact">
                        <dt>{price ? bookingPricing("startsFrom") : bookingPricing("price")}</dt>
                        <dd>
                          {price ? (
                            <>
                              <span className="le-amount">
                                {format.number(price.amount, {
                                  style: "currency",
                                  currency: price.currency,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span className="le-unit">{pricing(`unit.${price.unit}`)}</span>
                            </>
                          ) : (
                            <>
                              <span className="le-pending">{tc("pricePending")}</span>
                              <span className="le-unit">{bookingPricing("managerNotice")}</span>
                            </>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <Link href={`/book?experience=${encodeURIComponent(experience.id)}`} className="le-cta le-exp-book">
                      {tc("bookCta")} <span aria-hidden="true">↗</span>
                    </Link>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
