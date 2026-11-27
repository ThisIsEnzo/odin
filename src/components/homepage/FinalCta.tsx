"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

/** A calm editorial conclusion, not a second hero or pinned scroll scene. */
export function FinalCta() {
  const t = useTranslations("finalCta");
  const home = useTranslations("home");

  return (
    <section className="invitation surface-inverse">
      <div className="invitation-media" aria-hidden="true">
        <Image
          src="/images/hero/odin-hero-3.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_60%]"
        />
      </div>
      <div className="invitation-shade" aria-hidden="true" />
      <Container className="invitation-inner">
        <Reveal className="invitation-panel">
          <p className="eyebrow text-brand-cream">{home("heroKicker")}</p>
          <h2 className="invitation-title">{t("heading")}</h2>
          <p className="invitation-body">{t("body")}</p>
          <div className="invitation-actions">
            <Link href="/book" className={buttonVariants({ variant: "inverse", size: "lg" })}>
              {t("primaryCta")}
            </Link>
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
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
