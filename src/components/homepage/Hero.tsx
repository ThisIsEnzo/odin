import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Homepage Hero — CLAUDE.md §19/§20. The only homepage section this phase
 * builds; everything else in §20's 10-section list is a separate, later
 * Phase 3 task (see docs/IMPLEMENTATION_PLAN.md).
 *
 * All visible copy is in messages/*.json under "home" — nothing here is a
 * hardcoded string, and nothing here is a business fact (price, hours,
 * restriction) that belongs in src/data/odin instead.
 */
export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="bg-canvas">
      <Container className="animate-hero-reveal grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="text-center lg:text-left">
          <h1 className="font-display text-4xl leading-[1.15] text-ink xs:text-5xl lg:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 text-lg text-ink/75 sm:text-xl">{t("heroSubtitle")}</p>
          <div className="mt-8 flex flex-col items-center gap-3 xs:flex-row xs:justify-center lg:justify-start">
            <Link
              href="/book"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full xs:w-auto")}
            >
              {t("primaryCta")}
            </Link>
            <Link
              href="/experiences"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full xs:w-auto")}
            >
              {t("secondaryCta")}
            </Link>
          </div>
        </div>

        {/*
          Purely atmospheric/decorative — conveys nothing beyond the headline
          and subtitle already in text, so the *meaningful* accessible
          treatment is to mark it decorative (empty alt + aria-hidden), not
          to invent a description that would just repeat the H1 for screen
          reader users. See public/images/hero/placeholder.svg's own comment.
        */}
        <div className="order-first lg:order-none" aria-hidden="true">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-card lg:aspect-[4/3]">
            <img
              src="/images/hero/placeholder.svg"
              alt=""
              width={1600}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
