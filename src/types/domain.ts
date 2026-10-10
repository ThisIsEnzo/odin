/**
 * ODIN domain model. See /docs/DATA_MODEL.md for the full design rationale
 * (the facts-vs-content split in particular). These types hold business
 * FACTS only — never display strings. Display copy lives in
 * messages/{locale}.json, resolved at render time via translationNamespace.
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

export type PricingUnit = "person" | "child" | "vehicle" | "family" | "couple" | "activity" | "group";

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

/** Catalog membership is checked at runtime, so adding an activity needs no UI enum edit. */
export type ExperienceId = string;

export type BookingBehavior =
  | { model: "per_person" | "group" }
  | { model: "capacity_unit"; maxGuestsPerUnit: number; unitTranslationKey: string };

/** Only confirmed tiers belong here; slot intervals are not durations. */
export interface DurationOption {
  durationMinutes: number;
  price: Money;
  /** Explicit billing quantity: never infer vehicles/groups from guest count. */
  quantityBasis: "participant" | "booking" | "unit";
}
export interface EstimateLine {
  itemId: string;
  amount: number | null;
  /** Exact THB minor units on V3; legacy lines need not have this field. */
  amountMinor?: number | null;
  durationMinutes?: number;
  unitAmount?: number;
  quantity?: number;
  unit?: PricingUnit;
}
export interface BookingEstimate {
  version: 1 | 2;
  /** Present on V3 estimates; legacy V1 snapshots remain readable unchanged. */
  promotions?: import("@/lib/booking/promotions").PromotionSnapshot;
  currency: Currency;
  amount: number | null;
  items: EstimateLine[];
}
export interface Experience {
  id: ExperienceId;
  slug: string;
  translationNamespace: string;
  /** Public request behavior, independent of price basis. Absent = not bookable. */
  booking?: BookingBehavior;
  bookingImage?: string;
  operatingHours: OperatingHours;
  restrictions: ExperienceRestrictions;
  price: Money;
  /** Configurable per experience — never hardcode an interval in UI. */
  bookingIntervalMinutes: number;
  /** Historical V2 rider validation only. Public V3 never collects weights. */
  requiresWeight: boolean;
  /** Only set after business confirmation; never inferred from slot interval. */
  durationMinutes?: number;
  durationOptions?: DurationOption[];
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
  /** Explicit confirmed package billing basis; components never charged separately. */
  estimateBasis?: "package" | "participant";
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

/** A participant belongs to one activity. IDs survive editing; names are not required. */
export interface BookingParticipant { id: string; weightKg?: number }
export interface BookingOptionSelection { optionId: string; quantity: number }
export interface BookingOption {
  id: string;
  translationNamespace: string;
  type: "meal" | "transport" | "private-session" | "extended-duration" | "other";
  applicableTo: { experienceIds?: ExperienceId[]; packageIds?: string[] };
  constraints: { minQuantity: number; maxQuantity: number };
  price?: Money;
}
export interface ActivityBookingItem {
  id: string;
  type: "activity";
  experienceId: ExperienceId;
  date: string;
  time: string;
  /** Absent only when no approved duration tiers are available. */
  durationMinutes?: number;
  /** Count is derived from this array, never duplicated in the persisted model. */
  participants: BookingParticipant[];
  options: BookingOptionSelection[];
}
export interface PackageBookingItem {
  id: string;
  type: "package";
  packageId: string;
  components: ActivityBookingItem[];
  options: BookingOptionSelection[];
}
export type BookingItem = ActivityBookingItem | PackageBookingItem;
export type ContactChannel = "phone" | "email" | "line" | "whatsapp";
export interface BookingCustomer {
  name: string;
  email: string;
  phone: string;
  preferredChannel?: ContactChannel;
  /** Explicit handle/number; never inferred from phone. */
  channelIdentity?: string;
}
export interface BookingDraft {
  schemaVersion: 2;
  customer: BookingCustomer;
  items: BookingItem[];
  notes?: string;
  locale: Locale;
}
export interface BookingRequest extends BookingDraft {
  /** Server-derived immutable estimate at initial receipt; absent on legacy rows. */
  estimate?: BookingEstimate;
  /** Server-generated public reference; optional only for legacy fixtures. */
  reference?: string;
  id: string;
  status: "received" | "confirmed" | "declined" | "cancelled";
  createdAt: string;
}

/** V2 remains unchanged for historical records. V3 has no participant identities/weights. */
export interface BookingActivitySelection {
  activityId: ExperienceId;
  guestCount: number;
  durationMinutes?: number;
  unitCount?: number;
}
export interface BookingRequestDraft {
  schemaVersion: 3;
  visitDate: string;
  preferredStartTime: string;
  customer: { fullName: string; email: string; phone: string };
  activities: BookingActivitySelection[];
  notes?: string;
  locale: Locale;
}
export interface BookingRequestV3 extends BookingRequestDraft {
  estimate: BookingEstimate;
  id: string;
  reference: string;
  status: BookingRequest["status"];
  createdAt: string;
}
export type StoredBookingRequest = BookingRequest | BookingRequestV3;
export type SupportedBookingDraft = BookingDraft | BookingRequestDraft;

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
