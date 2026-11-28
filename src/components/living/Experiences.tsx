"use client";

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

const HUE: Record<string, string> = {
  "horse-riding": "horse",
  "pony-riding": "pony",
  atv: "atv",
  sauna: "sauna",
};

const camel = (id: string) => id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

export function Experiences({ items }: { items: Experience[] }) {
  const home = useTranslations("home");
  const t = useTranslations("experiences");
  const tc = useTranslations("experienceCard");
  const pricing = useTranslations("pricing");
  const bookingPricing = useTranslations("booking.pricing");
  const format = useFormatter();

  if (!items.length) return null;

  return (
    <section id="experiences" className="le-exp" aria-labelledby="le-exp-title">
      <div className="le-wrap">
        <div className="le-exp-head">
          <p className="le-note">01</p>
          <h2 id="le-exp-title" className="le-display le-exp-title">{home("experiencesHeading")}</h2>
          <p className="le-body">{home("experiencesIntro")}</p>
        </div>

        <div className="cx-grid">
          {items.map((experience, index) => {
            const price = offerPrice(experience);
            const hours = confirmedHours(experience);
            const durations = durationLabel(experience);
            const title = t(camel(experience.id) + ".title");
            const hue = HUE[experience.id] ?? "horse";

            return (
              <article
                key={experience.id}
                className={"cx cx-" + hue + (index % 2 === 1 ? " flip" : "")}
                aria-labelledby={"cx-title-" + experience.id}
              >
                <div className="cx-media">
                  <Image
                    src={experience.bookingImage ?? "/images/gallery/odin-gallery-01.jpg"}
                    alt={title}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1280px) 44vw, (min-width: 900px) 92vw, 100vw"
                    style={{ objectPosition: CROP[experience.id] ?? "center" }}
                  />
                  <div className="cx-bloom" aria-hidden="true" />
                </div>

                <div className="cx-copy">
                  <p className="le-note">0{index + 1} · ON GROUND</p>
                  <h3 id={"cx-title-" + experience.id} className="le-display">{title}</h3>
                  <p className="cx-desc">{t(camel(experience.id) + ".shortDescription")}</p>

                  <div className="le-chips">
                    {hours ? <span className="le-chip">{tc("hours", { open: hours.open, close: hours.close })}</span> : null}
                    {experience.restrictions.maxWeightKg ? (
                      <span className="le-chip">{tc("maxWeight", { max: experience.restrictions.maxWeightKg })}</span>
                    ) : null}
                  </div>

                  <dl className="cx-facts">
                    <div>
                      <dt>{bookingPricing("duration")}</dt>
                      <dd>
                        {durations.length
                          ? durations.map((minutes) => bookingPricing("minutes", { count: minutes })).join(" / ")
                          : bookingPricing("durationPending")}
                      </dd>
                    </div>
                    <div>
                      <dt>{price ? bookingPricing("startsFrom") : bookingPricing("price")}</dt>
                      <dd>
                        {price ? (
                          <>
                            <span className="cx-amount">
                              {format.number(price.amount, {
                                style: "currency",
                                currency: price.currency,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="cx-unit">{pricing("unit." + price.unit)}</span>
                          </>
                        ) : (
                          <>
                            <span className="cx-pending">{tc("pricePending")}</span>
                            <span className="cx-unit">{bookingPricing("managerNotice")}</span>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>

                  <Link href={"/book?experience=" + encodeURIComponent(experience.id)} className="le-cta cx-cta">
                    {tc("bookCta")} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
