import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { restaurant } from "@/data/odin/restaurant";

export function Restaurant() {
  const t = useTranslations(restaurant.translationNamespace);

  return (
    <section id="restaurant" className="le-table" aria-labelledby="le-table-title">
      <div className="le-table-media">
        <Image
          src="/images/restaurant/odin-restaurant.jpg"
          alt={t("title")}
          fill
          sizes="(min-width:1024px) 58vw, 100vw"
          style={{ objectPosition: "center 55%" }}
        />
      </div>
      <div className="le-table-copy">
        <p className="le-note le-note-light">04</p>
        <h2 id="le-table-title" className="le-display">{t("title")}</h2>
        <p className="le-table-description">{t("description")}</p>
        <p className="le-table-hours">{t("hoursLabel")} · {restaurant.operatingHours.open}–{restaurant.operatingHours.close}</p>
        <p className="le-table-menu">{t("menuComingSoon")}</p>
        <Link href="/book" className="le-cta le-cta-light le-table-cta">
          {t("cta")} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
