"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
export function FinalCta() {
  const t = useTranslations("finalCta"), home = useTranslations("home");
  return <ScrollScene height="170vh" className="finale surface-inverse">
    <div className="finale-media" aria-hidden="true"><Image src="/images/hero/odin-hero-2.jpg" alt="" fill sizes="100vw" className="object-cover" priority={false} /></div>
    <div className="finale-shade" aria-hidden="true" />
    <Container className="finale-content text-center">
      <p className="eyebrow mb-6 text-brand-cream">{home("heroKicker")}</p>
      <SplitText as="h2" text={t("heading")} className="finale-heading mx-auto max-w-[18ch]" stagger={70} />
      <Reveal delayMs={120}><p className="mt-5 text-canvas/80">{t("body")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/book" className={buttonVariants({ variant: "inverse", size: "lg" })}>{t("primaryCta")}</Link>
          <Link href="/#experiences" className={buttonVariants({ variant: "outline", size: "lg", className: "border-canvas/60 text-canvas hover:bg-canvas/10" })}>{t("secondaryCta")}</Link>
        </div>
      </Reveal>
    </Container>
  </ScrollScene>;
}
