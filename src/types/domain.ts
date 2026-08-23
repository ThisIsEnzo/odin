/**
 * ODIN domain model. See /docs/DATA_MODEL.md for the full design rationale
 * (the facts-vs-content split in particular). These types hold business
 * FACTS only — never display strings. Display copy lives in
 * messages/{locale}.json, resolved at render time via translationNamespace.
 *
 * Source: copied verbatim from odin_phase3_reconcile_reference.md
 * ("canonical Phase 2 source-of-truth reference files"). Not modified.
 */

export type Locale = "en" | "th" | "ru" | "zh";

export type OperatingHours = {
  /** 24h "HH:mm" */
  open: string;
  /** 24h "HH:mm" */
  close: string;
};

export type ExperienceRestrictions = {
  minAge?: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  /** Translation KEYS (e.g. "experiences.horseRiding.restrictions.helmet") — never raw strings. */
  notes?: string[];
};

export type Currency = "THB";

export type PricingUnit = "person" | "child" | "vehicle" | "family" | "couple";

export type Money = {
  amount: number;
  currency: Currency;
  unit: PricingUnit;
};

/** Mock-data provenance, attached per-field so partial confirmation is representable. */
export type MockFlag = {
  isMock: boolean;
  note?: string;
};

export type ExperienceId = "horse-riding" | "pony-riding" | "atv" | "sauna";

export interface Experience {
  id: ExperienceId;
  slug: string;
  translationNamespace: string;
  operatingHours: OperatingHours;
  restrictions: ExperienceRestrictions;
  price: Money;
  /** Configurable per experience — never hardcode an interval in UI. */
  bookingIntervalMinutes: number;
  /** Drives the conditional weight field in the booking flow (Phase 4). */
  requiresWeight: boolean;
  gallerySlugs: string[];
  mock: {
    price: MockFlag;
    ageRestriction: MockFlag;
  };
}

export interface Package {
  id: string;
  slug: string;
  translationNamespace: string;
  includedExperienceIds: ExperienceId[];
  includesRestaurant: boolean;
  price: Money;
  mock: MockFlag;
}

export interface RestaurantInfo {
  translationNamespace: string;
  operatingHours: OperatingHours;
  averageSpend: { min: number; max: number; currency: Currency; unit: "person" };
  cuisineTags: string[];
  menu: {
    /** Menu content itself is not yet defined at all — see MOCK_DATA.md §6. */
    isMock: true;
  };
}

export interface GalleryItem {
  id: string;
  /** Local path only — never an external hotlink. See MOCK_DATA.md §5. */
  src: string;
  altTranslationKey: string;
  tags: Array<ExperienceId | "restaurant" | "location">;
  width: number;
  height: number;
}

export interface FAQItem {
  id: string;
  translationNamespace: string;
  category?: "general" | "booking" | "experiences" | "restaurant";
}

export interface Review {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  translationNamespace?: string;
  source: "google" | "facebook" | "direct";
  /** Must be true before a review ships — see MOCK_DATA.md §6. Never fabricate testimonials. */
  isRealTestimonial: boolean;
}

export interface BookingRequest {
  id: string;
  type: "experience" | "package";
  experienceOrPackageId: string;
  /** ISO date, "YYYY-MM-DD" */
  date: string;
  /** "HH:mm", validated against the item's OperatingHours */
  time: string;
  guests: number;
  weightKg?: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  locale: Locale;
  status: "received" | "confirmed" | "declined" | "cancelled";
  createdAt: string;
}

export interface SiteConfig {
  businessName: string;
  address: { value: string } & MockFlag;
  phone: { value: string } & MockFlag;
  email: { value: string } & MockFlag;
  line: { value: string } & MockFlag;
  whatsapp: { value: string } & MockFlag;
  /** Deliberately approximate — no invented GPS coordinates. */
  locationDistanceFromPattaya: string;
  defaultLocale: "en";
  supportedLocales: Locale[];
  /** 0=Sunday..6=Saturday. Empty = open every day (current assumption — see MOCK_DATA.md §5). */
  closedWeekdays?: number[];
  /** ISO dates. Empty at MVP — exists so this doesn't need a schema change later. */
  blackoutDates?: string[];
}
