import { useFormatter, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { ChapterHeading } from "@/components/ui/ChapterHeading";
import { packages } from "@/data/odin/packages";
import type { Package } from "@/types/domain";

export function Packages() {
  const t = useTranslations("packages");

  if (packages.length === 0) return null;

  return (
    <Section id="packages" tone="canvas-soft">
      <Container>
        <Reveal>
          <ChapterHeading
            index="03"
            variant="ledger"
            title={t("heading")}
            intro={t("intro")}
            className="mb-10"
          />
        </Reveal>

        <ol className="ledger">
          {packages.map((pkg, index) => (
            <PackageRow key={pkg.id} pkg={pkg} index={index} />
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function PackageRow({ pkg, index }: { pkg: Package; index: number }) {
  const t = useTranslations(pkg.translationNamespace);
  const tExperiences = useTranslations("experiences");
  const tPackages = useTranslations("packages");
  const tPricing = useTranslations("pricing");
  const format = useFormatter();

  return (
    <li className="ledger-row">
      <span className="ledger-index" aria-hidden="true">
        0{index + 1}
      </span>

      <Reveal className="ledger-main" delayMs={Math.min(index * 90, 270)}>
        <h3 className="ledger-title">{t("title")}</h3>
        <p className="ledger-desc">{t("description")}</p>

        {pkg.includedExperienceIds.length > 0 ? (
          <ul className="ledger-tags">
            {pkg.includedExperienceIds.map((experienceId) => {
              const component = pkg.components?.find(
                (item) => item.activityId === experienceId,
              );
              const guestCount = component?.guestCount ?? 1;

              return (
                <li key={experienceId}>
                  <Badge variant="outline">
                    {tExperiences(`${toCamelCase(experienceId)}.title`)}
                    {guestCount > 1 ? ` × ${guestCount}` : ""}
                  </Badge>
                </li>
              );
            })}
            {pkg.includesRestaurant ? (
              <li>
                <Badge variant="outline">{tPackages("includesRestaurant")}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}
      </Reveal>

      <Reveal className="ledger-aside" delayMs={Math.min(index * 90 + 60, 330)}>
        <p className="ledger-price">
          {pkg.mock.isMock ? (
            tPackages("pricePending")
          ) : (
            <>
              {format.number(pkg.price.amount, {
                style: "currency",
                currency: pkg.price.currency,
              })}
              {" "}
              <span className="ledger-unit">
                {tPricing(`unit.${pkg.price.unit}`)}
              </span>
            </>
          )}
        </p>
        {pkg.mock.isMock ? (
          <p className="ledger-note">{tPackages("mockNote")}</p>
        ) : null}
        <Link
          href={`/book?package=${encodeURIComponent(pkg.id)}`}
          className={buttonVariants({
            variant: "secondary",
            size: "sm",
            className: "mt-2",
          })}
        >
          {tPackages("cta")}
        </Link>
      </Reveal>
    </li>
  );
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
