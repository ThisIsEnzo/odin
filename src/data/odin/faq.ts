import type { FAQItem } from "@/types/domain";

/**
 * A small set of structural placeholders proving the FAQ data shape and
 * i18n pipeline work end to end. The questions are reasonable defaults for
 * a booking site; the ANSWERS in messages/*.json are explicitly placeholder
 * text, not fabricated business facts (e.g. we don't invent a cancellation
 * policy here — that's real business information nobody has confirmed).
 * Full FAQ content is out of scope for this phase.
 *
 * Source: copied verbatim from odin_phase3_reconcile_reference.md. Not modified.
 */
export const faq: FAQItem[] = [
  { id: "how-to-book", translationNamespace: "faq.items.howToBook", category: "booking" },
  { id: "what-to-bring", translationNamespace: "faq.items.whatToBring", category: "experiences" },
  { id: "getting-there", translationNamespace: "faq.items.gettingThere", category: "general" },
];
