import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";


export function FinalCta() {
  const t = useTranslations("finalCta");
  const home = useTranslations("home");

  return (
    <section className="surface-inverse relative isolate bg-surface-dark py-28 text-canvas sm:py-40">
      <Image src="/images/hero/odin-hero-2.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-surface-deep/65" />
      <Reveal>
        <Container className="text-center">
          <p className="eyebrow mb-6 text-brand-cream">{home("heroKicker")}</p>
          <h2 className="mx-auto max-w-[18ch] font-display text-3xl leading-tight sm:text-4xl">{t("heading")}</h2>
          <p className="mt-4 text-canvas/80">{t("body")}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Reveal delayMs={0}>
              <Link href="/book" className={buttonVariants({ variant: "inverse", size: "lg" })}>
                {t("primaryCta")}
              </Link>
            </Reveal>
            <Reveal delayMs={90}>
              <Link
                href="/#experiences"
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
