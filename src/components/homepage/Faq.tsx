import { siteConfig } from "@/data/odin/site";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { faq as faqItems } from "@/data/odin/faq";
import type { FAQItem } from "@/types/domain";

/**
 * Questions — editorial Q&A. Native <details> keeps keyboard and screen-reader
 * behavior; the grid-rows reveal never gates the answer content.
 */
export function Faq() {
  const t = useTranslations("faq");
  if (!faqItems || faqItems.length === 0) return null;

  return (
    <Section id="faq" tone="canvas">
      <Container className="faq-editorial">
        <Reveal className="faq-rail">
          <h2 className="faq-rail-title">{t("heading")}</h2>
          <span className="faq-rail-rule" aria-hidden="true" />
        </Reveal>
        <div className="faq-list">
          {faqItems.map((item) => <FaqRow key={item.id} item={item} />)}
        </div>
      </Container>
    </Section>
  );
}

function FaqRow({ item }: { item: FAQItem }) {
  const t = useTranslations(item.translationNamespace);
  return (
    <details className="faq-row group">
      <summary className="faq-q">
        <span>{t("question")}</span>
        <span aria-hidden="true" className="faq-icon">+</span>
      </summary>
      <div className="faq-a-wrap">
        <div className="overflow-hidden">
          <p className="faq-a">
            {t("answer", { distance: siteConfig.locationDistanceFromPattaya })}
          </p>
        </div>
      </div>
    </details>
  );
}
