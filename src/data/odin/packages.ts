import type { Package } from "@/types/domain";

/**
 * All three packages — contents and prices — are MOCK per CLAUDE.md §17.
 * See /docs/MOCK_DATA.md §3.
 *
 * Source: copied verbatim from odin_phase3_reconcile_reference.md. Not modified.
 */
export const packages: Package[] = [
  {
    id: "family-day",
    slug: "family-day",
    translationNamespace: "packages.familyDay",
    includedExperienceIds: ["pony-riding"],
    includesRestaurant: true,
    price: { amount: 1990, currency: "THB", unit: "family" },
    mock: { isMock: true, note: "MOCK — package contents and price, confirm before launch" },
  },
  {
    id: "adventure-day",
    slug: "adventure-day",
    translationNamespace: "packages.adventureDay",
    includedExperienceIds: ["atv"],
    includesRestaurant: true,
    price: { amount: 2490, currency: "THB", unit: "person" },
    mock: { isMock: true, note: "MOCK — package contents and price, confirm before launch" },
  },
  {
    id: "couple-escape",
    slug: "couple-escape",
    translationNamespace: "packages.coupleEscape",
    includedExperienceIds: ["horse-riding", "sauna"],
    includesRestaurant: true,
    price: { amount: 3990, currency: "THB", unit: "couple" },
    mock: { isMock: true, note: "MOCK — package contents and price, confirm before launch" },
  },
];
