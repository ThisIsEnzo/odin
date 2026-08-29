import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { siteConfig } from "@/data/odin/site";
import { reviews } from "@/data/odin/reviews";

/**
 * Verified against docs/odin_phase3_reconcile_reference.md: `reviews` is
 * the correct named export from src/data/odin/reviews.ts, and it is `[]` in
 * the real data — so the "coming soon" branch below always renders today,
 * which is the correct, intentional empty state (MOCK_DATA.md §6), not a
 * bug. `review.{id,rating,authorName,isRealTestimonial}` match the Review
 * type in src/types/domain.ts exactly, so real reviews would render
 * correctly the moment the array is populated with `isRealTestimonial: true`
 * entries.
 */
export function ReviewsLocation() {
  const t = useTranslations("reviews");
  const tLocation = useTranslations("location");

  const realReviews = (reviews ?? []).filter((review) => review.isRealTestimonial);

  // PHASE 4C — TASK 7: no map/coordinates field exists anywhere in
  // SiteConfig or DATA_MODEL.md — no API key or SDK is introduced per the
  // brief; instead a plain Google Maps search URL is built from the
  // existing address string only (no invented coordinates). This is a
  // real, working link today and can host a proper embed later without
  // changing this URL's shape.
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteConfig.address.value,
  )}`;

  return (
    <Section tone="canvas">
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
            <div className="mt-6 rounded-card border border-moss/15 bg-white/40 p-6">
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

          {/* Location card — ready to host a real embed later; today it's
              address + distance + a genuine "Open in Google Maps" link
              built from the existing (MOCK, per MOCK_DATA.md §2) address
              string, not from invented coordinates. */}
          <div className="mt-6 overflow-hidden rounded-card border border-moss/15 bg-white/40">
            <div className="flex items-center justify-center bg-moss/10 py-10 text-sm text-ink/50">
              {tLocation("mapPlaceholder")}
            </div>
            <div className="p-5">
              <p className="text-sm text-ink/80">{siteConfig.address.value}</p>
              <a
                href={mapsSearchUrl}
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
