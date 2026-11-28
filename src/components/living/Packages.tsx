"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { packages } from "@/data/odin/packages";
import { offerPrice } from "@/lib/offer";
import type { Package } from "@/types/domain";

const camel = (id: string) => id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());

export function Packages() {
  const t = useTranslations("packages");
  if (!packages.length) return null;

  return (
    <section id="packages" className="le-pack" aria-labelledby="le-pack-title">
      <div className="le-wrap">
        <p className="le-note">03</p>
        <h2 id="le-pack-title" className="le-display le-pack-title">{t("heading")}</h2>
        <p className="le-body le-pack-intro">{t("intro")}</p>
        <ol className="le-ledger">
          {packages.map((pack, index) => <PackageRow key={pack.id} pack={pack} index={index} />)}
        </ol>
      </div>
    </section>
  );
}

function PackageRow({ pack, index }: { pack: Package; index: number }) {
  const t = useTranslations(pack.translationNamespace);
  const tx = useTranslations("experiences");
  const packagesT = useTranslations("packages");
  const pricingT = useTranslations("pricing");
  const format = useFormatter();
  const price = offerPrice(undefined, pack);

  return (
    <li className="le-row">
      <i aria-hidden="true">0{index + 1}</i>
      <div className="le-row-main">
        <h3>{t("title")}</h3>
        <p>{t("description")}</p>
        <div className="le-chips">
          {pack.includedExperienceIds.map((id) => {
            const component = pack.components?.find((item) => item.activityId === id);
            return (
              <span className="le-chip" key={id}>
                {tx(`${camel(id)}.title`)}
                {component && component.guestCount > 1 ? ` × ${component.guestCount}` : ""}
              </span>
            );
          })}
          {pack.includesRestaurant ? <span className="le-chip">{packagesT("includesRestaurant")}</span> : null}
        </div>
      </div>
      <div className="le-aside">
        {price ? (
          <span className="le-amount">
            {format.number(price.amount, { style: "currency", currency: price.currency, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <>
            <span className="le-pending">{packagesT("pricePending")}</span>
            <span className="le-unit">{packagesT("mockNote")}</span>
          </>
        )}
        <Link href={`/book?package=${encodeURIComponent(pack.id)}`} className="le-cta le-row-cta">
          {packagesT("cta")} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </li>
  );
}
