# ODIN — Data Model

Status: Phase 0 draft. Related: `ARCHITECTURE.md` §5 explains *why* the model is split this way;
this document is the *what*.

## 1. Design Principles

1. **Facts vs. content.** Types here hold business facts (numbers, enums, references) — never
   display strings. Display copy lives in `messages/{locale}.json`, keyed by each entity's
   `translationNamespace`. See `ARCHITECTURE.md` §5 for the full reasoning.
2. **One source of truth for business rules.** `maxWeightKg`, operating hours, and prices exist in
   exactly one TypeScript file per entity type. Validation (client and server), display, and any
   future CRM all read the same object.
3. **Mock-ness is data, not a comment.** Every value that §14–17 of the brief marks MOCK carries an
   explicit flag in the object, not a `// TODO` a future editor can miss. This makes "what's still
   placeholder" a query, not an archaeology exercise — see `MOCK_DATA.md` for the full audit this
   enables.

## 2. Shared Primitive Types

```ts
export type Locale = 'en' | 'th' | 'ru' | 'zh';

export type OperatingHours = {
  open: string;   // 24h "HH:mm"
  close: string;  // 24h "HH:mm"
};

export type ExperienceRestrictions = {
  minAge?: number;
  maxAge?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  notes?: string[];       // translation KEYS, e.g. 'experiences.horseRiding.restrictions.helmet'
                           // — never raw strings, to stay consistent with the facts/content split
};

export type Currency = 'THB';

export type PricingUnit = 'person' | 'child' | 'vehicle' | 'family' | 'couple';

export type Money = {
  amount: number;
  currency: Currency;
  unit: PricingUnit;
};

// Mock-data provenance, attached per-field so partial confirmation is representable
// (e.g. an experience's hours are confirmed while its age restriction is still MOCK).
export type MockFlag = {
  isMock: boolean;
  note?: string;   // short reason, e.g. "MOCK — awaiting business confirmation"
};
```

## 3. Domain Entities

```ts
export type ExperienceId = 'horse-riding' | 'pony-riding' | 'atv' | 'sauna';

export interface Experience {
  id: ExperienceId;
  slug: string;                          // matches the [slug] route segment
  translationNamespace: string;          // e.g. 'experiences.horseRiding'
  operatingHours: OperatingHours;        // CONFIRMED for all four — see MOCK_DATA.md
  restrictions: ExperienceRestrictions;
  price: Money;
  bookingIntervalMinutes: number;        // configurable — never hardcode an interval in UI
  requiresWeight: boolean;               // drives the conditional booking field, §11 of the brief
  gallerySlugs: string[];                // references into GalleryItem[]
  mock: {
    price: MockFlag;                     // all prices are MOCK per §15
    ageRestriction: MockFlag;            // age is MOCK per §16; weight is explicitly NOT
  };
}

export interface Package {
  id: string;
  slug: string;
  translationNamespace: string;
  includedExperienceIds: ExperienceId[];
  includesRestaurant: boolean;
  price: Money;
  mock: MockFlag;                        // entire package (contents + price) is MOCK per §17
}

export interface RestaurantInfo {
  translationNamespace: string;
  operatingHours: OperatingHours;        // CONFIRMED — 07:00–23:00
  averageSpend: { min: number; max: number; currency: Currency; unit: 'person' };
  cuisineTags: string[];
  menu: {
    isMock: true;                        // menu content itself is not yet defined — see MOCK_DATA.md §6
  };
}

export interface GalleryItem {
  id: string;
  src: string;                            // local placeholder path — never an external hotlink, §23
  altTranslationKey: string;
  tags: ExperienceId[] | 'restaurant'[] | string[];
  width: number;
  height: number;
}

export interface FAQItem {
  id: string;
  translationNamespace: string;           // resolves to { question, answer }
  category?: 'general' | 'booking' | 'experiences' | 'restaurant';
}

export interface Review {
  id: string;
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  translationNamespace?: string;          // present only if the review text itself is localized
  source: 'google' | 'facebook' | 'direct';
  isRealTestimonial: boolean;             // see MOCK_DATA.md §6 — must be true before this ships
}

export interface BookingRequest {
  id: string;
  type: 'experience' | 'package';
  experienceOrPackageId: string;
  date: string;                           // ISO date, "YYYY-MM-DD"
  time: string;                           // "HH:mm", validated against the item's OperatingHours
  guests: number;
  weightKg?: number;                      // present only when requiresWeight is true
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  locale: Locale;
  status: 'received' | 'confirmed' | 'declined' | 'cancelled';  // never auto-set to 'confirmed'
  createdAt: string;                      // ISO datetime
}

export interface SiteConfig {
  businessName: string;                          // "ODIN" — real, not mock
  address: { value: string } & MockFlag;
  phone: { value: string } & MockFlag;
  email: { value: string } & MockFlag;
  line: { value: string } & MockFlag;
  whatsapp: { value: string } & MockFlag;
  locationDistanceFromPattaya: string;           // "20 km" — approximate by design, no GPS
  defaultLocale: 'en';
  supportedLocales: Locale[];                    // ['en', 'th', 'ru', 'zh']
  closedWeekdays?: number[];                     // 0=Sunday..6=Saturday; empty = open every day (current assumption)
  blackoutDates?: string[];                      // ISO dates; empty at MVP, exists so it doesn't require a schema change later
}
```

## 4. Worked Example — the two non-negotiable numbers

The brief singles out horse and pony weight limits as confirmed, not mock. Here's how that reads
end to end, facts file → validation → UI, with nothing duplicated:

```ts
// src/data/odin/experiences.ts
export const experiences: Experience[] = [
  {
    id: 'horse-riding',
    slug: 'horse-riding',
    translationNamespace: 'experiences.horseRiding',
    operatingHours: { open: '07:00', close: '18:00' },
    restrictions: { minAge: 12, maxWeightKg: 90 },     // 90kg — CONFIRMED, not mock
    price: { amount: 1200, currency: 'THB', unit: 'person' },
    bookingIntervalMinutes: 60,
    requiresWeight: true,
    gallerySlugs: ['horse-01', 'horse-02'],
    mock: { price: { isMock: true }, ageRestriction: { isMock: true } },
  },
  {
    id: 'pony-riding',
    slug: 'pony-riding',
    translationNamespace: 'experiences.ponyRiding',
    operatingHours: { open: '07:00', close: '18:00' },
    restrictions: { minAge: 3, maxAge: 12, maxWeightKg: 60 },   // 60kg — CONFIRMED, not mock
    price: { amount: 500, currency: 'THB', unit: 'child' },
    bookingIntervalMinutes: 60,
    requiresWeight: true,
    gallerySlugs: ['pony-01'],
    mock: { price: { isMock: true }, ageRestriction: { isMock: true } },
  },
  {
    id: 'atv',
    slug: 'atv',
    translationNamespace: 'experiences.atv',
    operatingHours: { open: '07:00', close: '20:00' },
    restrictions: { minAge: 16 },
    price: { amount: 1500, currency: 'THB', unit: 'vehicle' },
    bookingIntervalMinutes: 30,
    requiresWeight: false,
    gallerySlugs: ['atv-01'],
    mock: { price: { isMock: true }, ageRestriction: { isMock: true } },
  },
  {
    id: 'sauna',
    slug: 'sauna',
    translationNamespace: 'experiences.sauna',
    operatingHours: { open: '08:00', close: '21:00' },
    restrictions: {},
    price: { amount: 800, currency: 'THB', unit: 'person' },
    bookingIntervalMinutes: 30,
    requiresWeight: false,
    gallerySlugs: ['sauna-01'],
    mock: { price: { isMock: true }, ageRestriction: { isMock: false } },
  },
];
```

| Experience | Hours (confirmed) | Weight limit (confirmed) | Age (MOCK) | Price (MOCK) |
|---|---|---|---|---|
| Horse Riding | 07:00–18:00 | 90 kg | 12+ | 1,200 THB / person |
| Pony Riding | 07:00–18:00 | 60 kg | 3–12 | 500 THB / child |
| ATV | 07:00–20:00 | — | 16+ | 1,500 THB / vehicle |
| Sauna | 08:00–21:00 | — | — | 800 THB / person |
| Restaurant | 07:00–23:00 | — | — | 500–800 THB / person (avg.) |

`BookingForm` reads `experience.requiresWeight` to decide whether to render the weight field at
all (§11); `booking.schema.ts` reads `experience.restrictions.maxWeightKg` to decide what to reject.
Neither hardcodes `90` or `60` — see `BOOKING_RULES.md` §4 for the schema itself.

## 5. Extensibility

- **New experience** (e.g. a future "Farm Tour"): add one object to `experiences.ts` + one message
  namespace. No new route file if it fits the existing template; no new booking logic unless it
  needs a genuinely new conditional field.
- **New conditional booking requirement** (e.g. a future "swimming ability" flag): add an optional
  field to `ExperienceRestrictions`/`Experience`, extend `BookingRequest`, extend the schema's
  conditional branch. `BookingForm` stays generic if it renders conditional fields by iterating a
  `requiresFields` list rather than hardcoding "weight" as a special case — worth building it that
  way now even though weight is the only one at MVP, since it's the same amount of code either way.
- **New locale:** add to `SiteConfig.supportedLocales`, add a `messages/{locale}.json`, add to
  `i18n/routing.ts`. No changes to `src/data/odin/*` — facts are locale-agnostic by construction.
