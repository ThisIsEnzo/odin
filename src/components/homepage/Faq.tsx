import { siteConfig } from "@/data/odin/site";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { faq as faqItems } from "@/data/odin/faq";
import type { FAQItem } from "@/types/domain";


export function Faq() {
  const t = useTranslations("faq");

  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <Section id="faq" tone="canvas-soft">
      <Reveal>
        <Container className="max-w-4xl">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("heading")}</h2>

          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
            {faqItems.map((item) => (
              <FaqRow key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </Reveal>
    </Section>
  );
}

function FaqRow({ item }: { item: FAQItem }) {
  const t = useTranslations(item.translationNamespace);

  return (
    <details className="group py-6 sm:py-8">
      <summary
        className={
          "flex cursor-pointer list-none items-center justify-between gap-4 " +
          "font-display text-lg text-ink marker:content-none " +
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        }
      >
        {t("question")}
        <span
          aria-hidden="true"
          className="shrink-0 text-xl text-moss transition-transform duration-150 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="mt-3 max-w-2xl text-ink/70">{t("answer", { distance: siteConfig.locationDistanceFromPattaya })}</p>
        </div>
      </div>
    </details>
  );
}
