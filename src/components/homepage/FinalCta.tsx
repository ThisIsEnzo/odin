import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

/**
 * A plain <section> (not the shared canvas/canvas-soft Section component) so
 * the closing band can confidently use the dark moss surface without
 * depending on Section internals that weren't inspected in this phase.
 * Both links (/book, /experiences) are the same routes already used by the
 * Header, MobileNav, and the Phase 3A Hero — nothing new is introduced.
 *
 * CINEMATIC MOTION REFINEMENT: the two CTA buttons now stagger slightly
 * relative to each other (nested Reveals inside the outer content Reveal)
 * per this phase's spec ("buttons: slightly staggered"). The dark
 * background itself never animates — only content, as before.
 */
export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-moss py-20 text-canvas sm:py-24">
      <Reveal>
        <Container className="max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">{t("heading")}</h2>
          <p className="mt-4 text-canvas/80">{t("body")}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Reveal delayMs={0}>
              <Link href="/book" className={buttonVariants({ variant: "primary", size: "lg" })}>
                {t("primaryCta")}
              </Link>
            </Reveal>
            <Reveal delayMs={90}>
              <Link
                href="/experiences"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-canvas/60 text-canvas hover:bg-canvas/10",
                })}
              >
                {t("secondaryCta")}
              </Link>
            </Reveal>
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
