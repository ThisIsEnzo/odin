import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { reviews } from "@/data/odin/reviews";

/**
 * Guest Stories (honest guestbook) + Find us (map-led). Real, permissioned
 * reviews only; otherwise an intentional coming-soon composition. The
 * existing Google Maps embed/listing is preserved; mock street address data
 * is never exposed.
 */
export function ReviewsLocation() {
  const t = useTranslations("reviews");
  const location = useTranslations("location");
  const realReviews = reviews.filter((review) => review.isRealTestimonial);

  return (
    <>
      <Section id="stories" tone="canvas" className="guestbook-section">
        <Container>
          {realReviews.length > 0 ? (
            <Reveal className="guestbook">
              <h2 className="guestbook-title">{t("heading")}</h2>
              <ul className="guestbook-list">
                {realReviews.map((review) => (
                  <li key={review.id} className="guestbook-entry">
                    <p className="guestbook-stars" aria-hidden="true">
                      {"★".repeat(review.rating)}<span className="text-ink/25">{"★".repeat(5 - review.rating)}</span>
                    </p>
                    <p className="guestbook-author">{review.authorName}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : (
            <Reveal className="guestbook-empty">
              <span className="guestbook-mark" aria-hidden="true">&ldquo;</span>
              <div className="guestbook-empty-body">
                <p className="eyebrow text-brand-primary">{t("heading")}</p>
                <h2 className="guestbook-empty-title">{t("comingSoonTitle")}</h2>
                <p className="guestbook-empty-text">{t("comingSoonBody")}</p>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      <Section id="location" tone="canvas-soft" className="findus-section">
        <Container className="findus-grid">
          <Reveal className="findus-copy">
            <p className="eyebrow text-brand-primary">
              {location("distanceBadge", { distance: siteConfig.locationDistanceFromPattaya })}
            </p>
            <h2 className="findus-title">{location("heading")}</h2>
            <p className="findus-body">{location("body")}</p>
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="findus-directions"
            >
              {location("openInMaps")} <span aria-hidden="true">↗</span>
            </a>
          </Reveal>
          <Reveal variant="mask" className="findus-map">
            <div className="findus-map-frame">
              <iframe
                src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s2612557755843089553"
                title={location("heading") + " — ON GROUND, Khao Mai Kaeo"}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
