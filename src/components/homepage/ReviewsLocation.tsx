import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { buttonVariants } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { reviews } from "@/data/odin/reviews";

export function ReviewsLocation() {
  const t = useTranslations("reviews");
  const location = useTranslations("location");
  const realReviews = reviews.filter(review => review.isRealTestimonial);

  return <Section id="location">
    <Container>
      {realReviews.length > 0 && <Reveal className="mb-16 border-b border-ink/15 pb-12">
        <h2>{t("heading")}</h2>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2">
          {realReviews.map(review => <li key={review.id} className="border-l border-brand-primary pl-5">
            <p className="text-brand-primary">{"★".repeat(review.rating)}<span className="text-ink/30">{"★".repeat(5-review.rating)}</span></p>
            <p className="mt-2 text-sm">{review.authorName}</p>
          </li>)}
        </ul>
      </Reveal>}
      <Reveal className="location-layout">
        <div>
          <p className="eyebrow mb-5 text-brand-primary">{location("distanceBadge", {distance: siteConfig.locationDistanceFromPattaya})}</p>
          <h2>{location("heading")}</h2>
          <p className="mt-5 max-w-md text-ink/70">{location("body", {distance: siteConfig.locationDistanceFromPattaya})}</p>
        </div>
        <div className="location-map-panel">
          <div className="location-map-frame">
            {/* Embed URL verified by resolving the client's exact Google Maps listing; no inferred coordinates or API key. */}
            <iframe
              src="https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s2612557755843089553"
              title={`${location("heading")} — ON GROUND, Khao Mai Kaeo`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <a href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({variant:"primary", className:"location-map-link"})}>
            {location("openInMaps")} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </Reveal>
    </Container>
  </Section>;
}
