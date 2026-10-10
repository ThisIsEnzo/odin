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
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(siteConfig.address.value)}`;

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
      <Reveal className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow mb-5 text-brand-primary">{location("distanceBadge", {distance: siteConfig.locationDistanceFromPattaya})}</p>
          <h2>{location("heading")}</h2>
          <p className="mt-5 max-w-md text-ink/70">{location("body", {distance: siteConfig.locationDistanceFromPattaya})}</p>
        </div>
        <div className="flex flex-col items-start justify-center border-y border-ink/20 py-10">
          <p className="max-w-md text-xl leading-relaxed sm:text-2xl">{siteConfig.address.isMock?location("pendingDirections"):siteConfig.address.value}</p>
          {!siteConfig.address.isMock&&<a href={mapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({variant:"outline", className:"mt-8"})}>
            {location("openInMaps")} <span aria-hidden="true">↗</span>
          </a>}
        </div>
      </Reveal>
    </Container>
  </Section>;
}
