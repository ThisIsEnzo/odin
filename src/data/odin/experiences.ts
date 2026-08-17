import type { Experience } from "@/types/domain";

/**
 * CONFIRMED, not mock: operatingHours and restrictions.maxWeightKg for
 * horse-riding and pony-riding. Do not change these without explicit
 * business sign-off — see /docs/BOOKING_RULES.md §2 and CLAUDE.md §6/§9.
 *
 * MOCK: price and restrictions.minAge / maxAge on every entry (flagged
 * per-item in `mock`). See /docs/MOCK_DATA.md §3–4.
 *
 * requiresWeight drives the conditional booking field (Phase 4) — weight is
 * asked for horse-riding and pony-riding only, per CLAUDE.md §11.
 */
export const experiences: Experience[] = [
  {
    id: "horse-riding",
    slug: "horse-riding",
    translationNamespace: "experiences.horseRiding",
    operatingHours: { open: "07:00", close: "18:00" },
    restrictions: { minAge: 12, maxWeightKg: 90 },
    price: { amount: 1200, currency: "THB", unit: "person" },
    bookingIntervalMinutes: 60,
    requiresWeight: true,
    gallerySlugs: ["horse-01"],
    mock: {
      price: { isMock: true },
      ageRestriction: { isMock: true },
    },
  },
  {
    id: "pony-riding",
    slug: "pony-riding",
    translationNamespace: "experiences.ponyRiding",
    operatingHours: { open: "07:00", close: "18:00" },
    restrictions: { minAge: 3, maxAge: 12, maxWeightKg: 60 },
    price: { amount: 500, currency: "THB", unit: "child" },
    bookingIntervalMinutes: 60,
    requiresWeight: true,
    gallerySlugs: ["pony-01"],
    mock: {
      price: { isMock: true },
      ageRestriction: { isMock: true },
    },
  },
  {
    id: "atv",
    slug: "atv",
    translationNamespace: "experiences.atv",
    operatingHours: { open: "07:00", close: "20:00" },
    restrictions: { minAge: 16 },
    price: { amount: 1500, currency: "THB", unit: "vehicle" },
    bookingIntervalMinutes: 30,
    requiresWeight: false,
    gallerySlugs: ["atv-01"],
    mock: {
      price: { isMock: true },
      ageRestriction: { isMock: true },
    },
  },
  {
    id: "sauna",
    slug: "sauna",
    translationNamespace: "experiences.sauna",
    operatingHours: { open: "08:00", close: "21:00" },
    restrictions: {},
    price: { amount: 800, currency: "THB", unit: "person" },
    bookingIntervalMinutes: 30,
    requiresWeight: false,
    gallerySlugs: ["sauna-01"],
    mock: {
      price: { isMock: true },
      ageRestriction: { isMock: false, note: "No age restriction documented for sauna" },
    },
  },
];

export function getExperienceBySlug(slug: string): Experience | undefined {
  return experiences.find((experience) => experience.slug === slug);
}

export const experienceSlugs = experiences.map((experience) => experience.slug);
