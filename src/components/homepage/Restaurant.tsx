import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { restaurant } from "@/data/odin/restaurant";

/**
 * NOTE: `restaurant` is imported from src/data/odin/restaurant.ts per
 * ARCHITECTURE.md/DATA_MODEL.md (RestaurantInfo) — the same import already
 * used by Footer.tsx (`restaurant.operatingHours.open/close`), so the export
 * name is confirmed. The rest of the shape (averageSpend, menu.isMock)
 * follows DATA_MODEL.md's documented type and was not independently
 * inspected in a live file — flagged for verification before merge.
 */
export function Restaurant() {
  const t = useTranslations(restaurant.translationNamespace);
  const tRestaurant = useTranslations("restaurant");

  return (
    <Section tone="canvas">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Visual area — no real restaurant photography supplied for this phase; a
            textured surface stands in so the composition is ready for a photo later. */}
        <div
          aria-hidden="true"
          className="order-2 h-56 rounded-card bg-[linear-gradient(135deg,_var(--color-moss)_0%,_var(--color-moss-dark)_100%)] sm:h-72 lg:order-1 lg:h-96"
        />

        <div className="order-1 lg:order-2">
          <Badge variant="saddle" className="mb-4">
            {tRestaurant("title")}
          </Badge>
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-lg text-ink/75">{t("description")}</p>

          <dl className="mt-6 flex flex-col gap-3 text-sm text-ink/70">
            <div className="flex items-center gap-2">
              <dt className="font-medium text-ink">{tRestaurant("hoursLabel")}</dt>
              <dd>
                {restaurant.operatingHours.open}–{restaurant.operatingHours.close}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="font-medium text-ink">{tRestaurant("avgSpendLabel")}</dt>
              <dd>
                {restaurant.averageSpend.min}–{restaurant.averageSpend.max}{" "}
                {restaurant.averageSpend.currency}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-sm text-ink/50">{tRestaurant("menuComingSoon")}</p>

          <Link
            href="/book"
            className={buttonVariants({ variant: "primary", size: "md", className: "mt-6" })}
          >
            {tRestaurant("cta")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
