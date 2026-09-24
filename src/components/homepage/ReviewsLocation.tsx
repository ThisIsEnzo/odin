import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { reviews } from "@/data/odin/reviews";


export function ReviewsLocation() {
  const t = useTranslations("reviews");
  const tLocation = useTranslations("location");

  const realReviews = (reviews ?? []).filter((review) => review.isRealTestimonial);

  // PHASE 4C — TASK 7: no map/coordinates field exists anywhere in
  // SiteConfig or DATA_MODEL.md — no API key or SDK is introduced per the
  // brief; instead a Google Maps URL is built from the existing address
  // string only (no invented coordinates).
  //
  // PHASE 5A: switched from the plain "search" endpoint to Maps' documented
  // "directions" deep link (`maps/dir/?api=1&destination=...`) so the CTA
  // does what its label says — a visitor tapping "Open in Google Maps" from
  // the Location section is asking for directions there, not just a pin to
  // look at. Still built from `siteConfig.address.value` only; no
  // coordinates are introduced, and this remains a real, working link today
  // that can host a proper embed later without changing its shape.
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    siteConfig.address.value,
  )}`;

  return (
    <Section id="location" tone="canvas">
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("heading")}</h2>

          {realReviews.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-5">
              {realReviews.map((review) => (
                <li key={review.id} className="border-l-2 border-dusk/50 pl-5">
                  <p className="text-ink/80">
                    {"★".repeat(review.rating)}
                    <span className="text-ink/30">{"★".repeat(5 - review.rating)}</span>
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">{review.authorName}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 border-t border-ink/20 py-8">
              <p className="font-display text-lg text-ink">{t("comingSoonTitle")}</p>
              <p className="mt-2 text-sm text-ink/70">{t("comingSoonBody")}</p>
            </div>
          )}
        </Reveal>

        <Reveal variant="right" delayMs={80}>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{tLocation("heading")}</h2>
          <p className="mt-4 max-w-md text-ink/75">
            {tLocation("body", { distance: siteConfig.locationDistanceFromPattaya })}
          </p>
          <Badge variant="outline" className="mt-4">
            {tLocation("distanceBadge", { distance: siteConfig.locationDistanceFromPattaya })}
          </Badge>

          
          <div className="mt-8 border-y border-ink/20">
            
            <div className="py-8">
              <p className="text-sm text-ink/80">{siteConfig.address.value}</p>
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4" })}
              >
                {tLocation("openInMaps")}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
