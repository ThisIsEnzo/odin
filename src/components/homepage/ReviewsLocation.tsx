import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/data/odin/site";
import { reviews } from "@/data/odin/reviews";

/**
 * NOTE: `reviews` is imported from src/data/odin/reviews.ts per
 * ARCHITECTURE.md (`reviews.ts # Review[] — likely empty at MVP launch`)
 * and DATA_MODEL.md's Review type. That file wasn't part of the material
 * supplied for this phase; the import name follows the documented
 * architecture and should be verified before merge. Per MOCK_DATA.md §6,
 * no fabricated testimonials are introduced here regardless of the array's
 * actual current contents — real, permissioned reviews render as cards;
 * anything else (empty, or not yet marked `isRealTestimonial`) renders the
 * honest "coming soon" state below.
 */
export function ReviewsLocation() {
  const t = useTranslations("reviews");
  const tLocation = useTranslations("location");

  const realReviews = (reviews ?? []).filter((review) => review.isRealTestimonial);

  return (
    <Section tone="canvas">
      <Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
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
        </div>

        <div>
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{tLocation("heading")}</h2>
          <p className="mt-4 max-w-md text-ink/75">
            {tLocation("body", { distance: siteConfig.locationDistanceFromPattaya })}
          </p>
          <Badge variant="outline" className="mt-4">
            {tLocation("distanceBadge", { distance: siteConfig.locationDistanceFromPattaya })}
          </Badge>
        </div>
      </Container>
    </Section>
  );
}
