import type { RestaurantInfo } from "@/types/domain";

/**
 * operatingHours is CONFIRMED (CLAUDE.md §6/§22). averageSpend is MOCK
 * (§15). Menu content itself is not yet defined at all — not even a mock
 * placeholder was supplied — see /docs/MOCK_DATA.md §5.
 */
export const restaurant: RestaurantInfo = {
  translationNamespace: "restaurant",
  operatingHours: { open: "07:00", close: "23:00" },
  averageSpend: { min: 500, max: 800, currency: "THB", unit: "person" },
  // Not specified anywhere in CLAUDE.md — left empty rather than invented.
  // Populate once the business confirms cuisine style.
  cuisineTags: [],
  menu: { isMock: true },
};
