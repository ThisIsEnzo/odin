import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/odin/site";

/**
 * CINEMATIC ARRIVAL — one authentic landscape, editorial type in the scene,
 * a restrained travel postmark and a linen strip that leads into the visit brief.
 */
export function HeroArrival() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const location = useTranslations("location");

  return (
    <section className="arrival" aria-labelledby="arrival-title">
      <div className="arrival-stage">
        <div className="arrival-media" aria-hidden="true">
          <Image
            src="/images/hero/odin-hero-2.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="arrival-img object-cover"
          />
        </div>
        <div className="arrival-scrim" aria-hidden="true" />

        <svg className="arrival-postmark" viewBox="0 0 136 136" aria-hidden="true">
          <defs>
            <path
              id="arrival-postmark-circle"
              d="M68 68 m-48 0 a48 48 0 1 1 96 0 a48 48 0 1 1 -96 0"
            />
          </defs>
          <circle cx="68" cy="68" r="48" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="68" cy="68" r="34" fill="none" stroke="currentColor" strokeWidth=".65" />
          <text fontSize="7.2" letterSpacing="1.5" fill="currentColor">
            <textPath href="#arrival-postmark-circle" startOffset="50%" textAnchor="middle">
              ON GROUND · KHAO MAI KAEO · CHON BURI ·
            </textPath>
          </text>
          <text x="68" y="66" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor">
            TH
          </text>
          <path d="M54 77h28" stroke="currentColor" strokeWidth=".75" />
          <text x="68" y="87" textAnchor="middle" fontSize="5.5" letterSpacing="1.2" fill="currentColor">
            ARRIVAL
          </text>
        </svg>

        <Container className="arrival-content">
          <p className="eyebrow arrival-kicker">{t("heroKicker")}</p>
          <h1 id="arrival-title" className="arrival-title">{t("heroTitle")}</h1>
          <p className="arrival-sub">{t("heroSubtitle")}</p>
          <div className="arrival-actions">
            <Link href="/book" className={buttonVariants({ size: "lg" })}>
              {nav("bookNow")} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </div>

      <div className="arrival-strip">
        <Container className="arrival-strip-inner">
          <span className="arrival-place">
            {location("distanceBadge", { distance: siteConfig.locationDistanceFromPattaya })}
          </span>
          <Link href="/#experiences" className="arrival-strip-link">
            {t("secondaryCta")} <span aria-hidden="true">↓</span>
          </Link>
        </Container>
      </div>
    </section>
  );
}
