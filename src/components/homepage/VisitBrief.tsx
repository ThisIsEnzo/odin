import { useTranslations } from "next-intl";
import { siteConfig } from "@/data/odin/site";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buildVisitFacts } from "@/lib/visit-brief";

export function VisitBrief() {
  const t = useTranslations();
  const facts = buildVisitFacts();

  const items = [
    {
      label: t("home.statDistanceLabel"),
      value: t("location.distanceBadge", { distance: facts.distance }),
    },
    {
      label: t("restaurant.title"),
      value: `${t("restaurant.hoursLabel")} · ${facts.restaurantHours}`,
    },
    {
      label: t("home.statExperiencesLabel"),
      value: t("home.statExperiences", { count: facts.experienceCount }),
    },
  ];

  return (
    <section className="visit-brief" aria-labelledby="visit-brief-title">
      <Container className="visit-brief-inner">
        <div className="visit-brief-head">
          <span className="visit-brief-mark" aria-hidden="true">✳</span>
          <h2 id="visit-brief-title" className="visit-brief-title">
            {t("restaurant.cta")}
          </h2>
          <p className="visit-brief-note">{t("home.heroNote")}</p>
          <div className="visit-brief-actions">
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="visit-brief-maps"
            >
              {t("location.openInMaps")} <span aria-hidden="true">↗</span>
            </a>
            <Link href="/book" className="visit-brief-book">
              {t("footer.requestContact")}
            </Link>
          </div>
        </div>
        <dl className="visit-brief-facts">
          {items.map((item) => (
            <div key={item.label} className="visit-brief-fact">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
