import { useFormatter, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { packages } from "@/data/odin/packages";
import type { Package } from "@/types/domain";


export function Packages() {
  const t = useTranslations("packages");

  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <Section id="packages" tone="canvas-soft">
      <Container>
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("heading")}</h2>
            <p className="mt-2 text-ink/70">{t("intro")}</p>
          </div>
        </Reveal>

        <div className="mt-14 divide-y divide-ink/20 border-t border-ink/20">
          {packages.map((pkg, index) => (
            <Reveal key={pkg.id} className="h-full" delayMs={Math.min(index * 100, 300)}>
              <PackageCard pkg={pkg} index={index} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const t = useTranslations(pkg.translationNamespace);
  const tExperiences = useTranslations("experiences");
  const tPackages = useTranslations("packages");
  const tPricing = useTranslations("pricing");
  const format = useFormatter();

  return (
    <article className="grid grid-cols-[36px_minmax(0,1fr)] gap-4 py-10 sm:py-12 lg:grid-cols-[64px_minmax(0,1fr)]">
      <span aria-hidden="true" className="pt-1 text-lg font-normal tabular-nums text-brand-primary/70">0{index + 1}</span>
      <div className="grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_250px]">
        <div>
        <h3 className="text-2xl sm:text-3xl">{t("title")}</h3>
        <p className="mt-4 max-w-xl text-ink/70">{t("description")}</p>

        {pkg.includedExperienceIds.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {pkg.includedExperienceIds.map((experienceId) => (
              <li key={experienceId}>
                <Badge variant="outline">
                  {tExperiences(`${toCamelCase(experienceId)}.title`)}{(pkg.components?.find(c => c.activityId === experienceId)?.guestCount ?? 1) > 1 ? ` × ${pkg.components!.find(c => c.activityId === experienceId)!.guestCount}` : ""}
                </Badge>
              </li>
            ))}
            {pkg.includesRestaurant ? (
              <li>
                <Badge variant="outline">{tPackages("includesRestaurant")}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        </div><div className="mt-6 flex flex-col items-start gap-3 lg:mt-0 lg:border-l lg:border-ink/15 lg:pl-8">
          <p className="text-sm font-medium text-ink">
            {pkg.mock.isMock ? tPackages("pricePending") : <>{format.number(pkg.price.amount,{style:"currency",currency:pkg.price.currency})}{" "}
            <span className="font-normal text-text-secondary">
              {tPricing(`unit.${pkg.price.unit}`)}
            </span></>}
          </p>
          {pkg.mock.isMock ? (
            <p className="text-xs text-text-secondary">{tPackages("mockNote")}</p>
          ) : null}
          
          <Link
            href={`/book?package=${encodeURIComponent(pkg.id)}`}
            className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-2" })}
          >
            {tPackages("cta")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
