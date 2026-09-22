import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { faq as faqItems } from "@/data/odin/faq";
import type { FAQItem } from "@/types/domain";

/**
 * NOTE: the canonical export from src/data/odin/faq.ts is named `faq` (see
 * docs/odin_phase3_reconcile_reference.md) — aliased here to `faqItems` so
 * the rest of this component reads the same as before. `translationNamespace`
 * matches FAQItem in src/types/domain.ts exactly (e.g. "faq.items.howToBook").
 *
 * Accordion: package.json only lists @radix-ui/react-dialog, not an
 * accordion primitive, so this uses native <details>/<summary> — fully
 * keyboard- and screen-reader-accessible with zero extra dependencies,
 * rather than reaching for a library that isn't actually installed.
 *
 * CINEMATIC MOTION REFINEMENT: opening/closing now animates smoothly
 * instead of the browser's native instant snap — a `grid-template-rows`
 * 0fr→1fr transition on a wrapper around the answer (the standard pure-CSS
 * technique for animating a native `<details>`'s height without JS),
 * driven by Tailwind's `group-open:` variant against the same `group`
 * class already used for the "+" rotation below. Still real
 * `<details>`/`<summary>` throughout — keyboard/screen-reader behavior is
 * unchanged, and only the toggled row's own answer transitions, never the
 * rest of the section.
 */
export function Faq() {
  const t = useTranslations("faq");

  if (!faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <Section id="faq" tone="canvas-soft">
      <Reveal>
        <Container className="max-w-3xl">
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
    <details className="group py-4">
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
          <p className="mt-3 max-w-2xl text-ink/70">{t("answer")}</p>
        </div>
      </div>
    </details>
  );
}
