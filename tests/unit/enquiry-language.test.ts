import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import ru from "../../messages/ru.json";
import th from "../../messages/th.json";
import zh from "../../messages/zh.json";

const LOCALES = { en, ru, th, zh } as const;
type Locale = keyof typeof LOCALES;
const get = (obj: unknown, path: string): unknown =>
  path.split(".").reduce<unknown>(
    (acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined),
    obj,
  );

const REQUIRED_KEYS = [
  "nav.bookNow", "home.secondaryCta", "home.heroNote", "experienceCard.bookCta",
  "packages.cta", "restaurant.cta", "finalCta.primaryCta", "finalCta.secondaryCta",
  "footer.requestContact", "whyOdin.experienceCount", "faq.items.howToBook.question",
  "faq.items.howToBook.answer", "booking.pageTitle", "booking.actions.submit",
  "booking.actions.submitting", "booking.ux.reviewCta", "booking.review.disclaimer",
  "booking.errors.networkFailed", "booking.errors.invalidSubmission", "booking.v3.review",
  "booking.v3.edit", "booking.v3.send", "booking.v3.sending", "booking.v3.reviewIntro",
  "booking.v3.requestNotice", "booking.success.title", "booking.success.body",
  "booking.success.viewExperiences",
] as const;

const SUCCESS_TITLE: Record<Locale, string> = {
  en: "Request Received", ru: "Заявка получена", th: "ได้รับคำขอแล้ว", zh: "申请已收到",
};
const RECEIPT_PHRASE: Record<Locale, string> = {
  en: "request has been received",
  ru: "получили вашу заявку",
  th: "เราได้รับคำขอของคุณแล้ว",
  zh: "已收到您的申请",
};
const CONFIRMATION_LANGUAGE = [
  "reservation confirmed", "booking confirmed", "бронирование подтверждено",
  "จองเรียบร้อยแล้ว", "预订已确认",
];

describe("enquiry language", () => {
  for (const [locale, dict] of Object.entries(LOCALES) as [Locale, (typeof LOCALES)[Locale]][]) {
    it(`${locale}: every enquiry copy key exists and is non-empty`, () => {
      for (const key of REQUIRED_KEYS) {
        const value = get(dict, key);
        expect(typeof value, `${locale}:${key}`).toBe("string");
        expect((value as string).trim().length, `${locale}:${key}`).toBeGreaterThan(0);
      }
    });

    it(`${locale}: all entry CTAs use one planner label`, () => {
      const entry = get(dict, "nav.bookNow");
      expect(get(dict, "restaurant.cta")).toBe(entry);
      expect(get(dict, "finalCta.primaryCta")).toBe(entry);
      expect(get(dict, "footer.requestContact")).toBe(entry);
    });

    it(`${locale}: success explicitly communicates receipt, not confirmation`, () => {
      const title = get(dict, "booking.success.title");
      const body = String(get(dict, "booking.success.body")).toLocaleLowerCase();
      expect(title).toBe(SUCCESS_TITLE[locale]);
      expect(body).toContain(RECEIPT_PHRASE[locale].toLocaleLowerCase());
      for (const forbidden of CONFIRMATION_LANGUAGE) expect(body).not.toContain(forbidden);
    });

    it(`${locale}: request notice is distinct from the success message`, () => {
      const notice = String(get(dict, "booking.v3.requestNotice"));
      expect(notice.trim().length).toBeGreaterThan(0);
      expect(notice).not.toBe(get(dict, "booking.success.body"));
    });

    it(`${locale}: submit and loading labels differ`, () => {
      expect(get(dict, "booking.v3.send")).not.toBe(get(dict, "booking.v3.sending"));
      expect(get(dict, "booking.actions.submit")).not.toBe(get(dict, "booking.actions.submitting"));
    });
  }

  it("no locale retains a Book Now-style entry CTA", () => {
    const legacyLabels = ["Book Now", "Забронировать", "จองเลย", "立即预订"];
    for (const [locale, dict] of Object.entries(LOCALES)) {
      expect(legacyLabels, locale).not.toContain(get(dict, "nav.bookNow"));
    }
  });
});
