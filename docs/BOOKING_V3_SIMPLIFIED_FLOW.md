# Booking V3 — simplified request flow

The public flow is one visit/contact/activity form → Review → Send booking request → Request received. It is a hospitality request, not checkout or instant confirmation. Global visit date and arrival preference apply to the whole visit. Count-based canonical activity selections, approved duration tiers and explicit price quantity bases determine estimates. Historical V2 records retain their original meaning.

## PROMOTIONS / DISCOUNTS

### Business authority and production status

**CONFIRMED PRODUCTION PROMOTIONS: none.** `src/data/odin/promotions.ts` deliberately contains an empty list with configuration version `no-confirmed-promotions-v1`. Enabling a promotion requires actual client-approved business configuration, canonical targets, approved pricing and translated labels. Nothing in this delivery activates a sample discount or creates/renames packages or price tiers.

**EXAMPLES / TEST FIXTURES ONLY:** `tests/fixtures/promotions.ts` includes two activities → 5%, three or more → 10%, a synthetic `test-all-inclusive` Wednesday → 20%, and synthetic `test-basic` booked on a particular business date → 10%. These IDs and offers are NOT real products or confirmed business offers. Further combination, seasonal, fixed, exclusive and stacking examples live only in tests. Production code never imports these fixtures.

### Canonical configuration schema

`src/lib/booking/promotions.ts` exports the strict runtime `promotionSchema`, `Promotion`, `PromotionConfig`, and the locale-independent calculator. The business edits one authoritative configuration module; Booking components contain no offer-specific eligibility conditions.

| Field | Meaning |
| --- | --- |
| `id`, `enabled` | Stable offer identity and explicit activation |
| `labels` | Required EN/RU/TH/ZH display labels, outside calculation logic |
| `labelKey` | Optional existing translation key; UI resolves it or uses the structured locale label |
| `scope` | `booking`, `activity`, or `package` |
| `targets.activityIds`, `targets.packageIds` | Canonical IDs; omit targets to include all eligible lines of the scope |
| `conditions.activityCount` | Inclusive min/optional max; requires explicit `packageCounting` policy |
| `conditions.activityCombination` | All listed standalone activity IDs must be selected; order independent |
| `conditions.visitDate` | Optional `from`, `through`, `weekdays` on the VISIT business-calendar date |
| `conditions.bookingDate` | Same fields on server SUBMISSION business-calendar date |
| `conditions.requiresPromoCode` | Reserved eligibility gate; currently always ineligible when true |
| `benefit` | Percentage integer `basisPoints` (100 = 1%) or `fixed_amount` integer `amountMinor` in THB |
| `activePeriod` | Optional submission-time `startsOn`/`endsOn` calendar dates, `startsAt`/`endsAt` absolute timestamps with offset |
| `stacking`, `stackingGroup` | Compatibility and best-only group |
| `priority` | Optional integer (default zero); explicit calculation order and optional conflict policy |
| `PromotionConfig.version` | Business configuration revision preserved in snapshots |
| `PromotionConfig.conflictResolution` | Default `best_price`; explicitly opt in to `priority` only for intentional business overrides |

Configuration validation rejects bad dates, reversed windows/count ranges, incompatible scope targets, fractional/out-of-range benefits and duplicate IDs. At most 16 simultaneously eligible offers are supported by the bounded exact MVP optimizer. Configuration errors fail a new submission safely; they never silently guess, skip invalid business rules or affect a stored replay. This is deliberately a small config module, not a promotion CMS.

### Eligibility, counts and packages

V3 adapters derive lines from canonical bookable activities and approved duration tiers. Guest count and vehicle/unit count affect base price only, never selected activity count. Restaurant has no bookable pricing metadata and is rejected by the V3 request schema. It is not counted. Future canonical bookable activities use the same generic adapter.

Count distinct standalone canonical activity IDs. A package is one top-level priced selection; its internal components NEVER become extra standalone priced lines. Each count offer must explicitly configure:

- `excluded`: ignore package selections and all their components.
- `one_selection`: count each top-level package once, alongside distinct standalone activity IDs.
- `components`: count the union of canonical component activity IDs and standalone activity IDs, deduplicating overlap.

There is **no production package-count policy inferred here**. When count targets are supplied, they also restrict which selections contribute to the count. Combinations require standalone selected activities, so a hidden package component cannot accidentally unlock Horse + ATV. A future need for component-based combinations can be introduced as an explicit new condition.

Targeting restricts the discounted base as well as eligibility. Booking scope can target activity and/or package IDs; activity scope accepts only activity targets, package scope only package targets. An untargeted booking offer uses the entire eligible subtotal. Package support is tested with canonical-shaped top-level package lines in the shared engine. The current V3 public request still contains activities only: actual package selection needs a future approved server catalog adapter. Mock packages and historical V2 estimates are not promoted into current offers.

### Thailand calendar semantics

All business-date derivation uses `Asia/Bangkok`. A visit date is a validated `YYYY-MM-DD` Thailand calendar value: its weekday is calculated from that calendar value, never by interpreting it in the browser's timezone. Weekdays are 0 Sunday through 6 Saturday.

Submission date comes from server `createdAt`, converted into the Thailand calendar. Thus `2026-10-10T17:00:00Z` is October 11 for booking-date conditions. A Wednesday visit offer does not require Wednesday submission; a book-today offer does not require visiting today. An offer without a required visit date cannot match a visit-date condition while the form date is empty.

`from`/`through`, `startsOn`/`endsOn` and timestamp endpoints are inclusive. Active periods gate submission, while visit-date ranges explicitly gate the visit. A Songkran *visit* window belongs in `conditions.visitDate`; a limited *booking* campaign window belongs in `activePeriod` or `conditions.bookingDate`. Future/expired offers cannot apply early/late. Absolute instants require explicit ISO timezone offsets.

### Stacking, groups, BEST_ONLY and priority

The engine evaluates eligible offers and legal compatible subsets; it chooses the plan with greatest exact customer saving over the final calculation. It does not depend on configuration array order. A better complete stackable plan can beat an exclusive offer, or vice versa.

- `STACKABLE`: may combine with other compatible offers, including across groups.
- `EXCLUSIVE`: applies alone across the whole request, including all scopes/groups.
- `BEST_ONLY`: at most one offer from its `stackingGroup`. If either offer in the same group is BEST_ONLY, the pair cannot stack. Ungrouped BEST_ONLY offers form one global best-only group.
- Different best-only groups can stack. Put mutually exclusive cross-group offers in the same group or use EXCLUSIVE.

A two-activity min-two offer and three-activity min-three offer can both qualify for three selections. In the multi-activity BEST_ONLY group only the better final price wins: 10%, never 5% + 10%.

Default `best_price` chooses money before priority. Merely assigning priority 99 to a poorer BEST_ONLY discount cannot defeat a better price. `conflictResolution: 'priority'` is an explicit business override: compatible plans compare descending priority vectors before price, so it can intentionally choose a worse price; it must not be used casually. Priority also orders application within a stage. Equal-price plans prefer fewer offers, then sorted stable offer IDs.

For unknown discounted bases a numeric best price is impossible. Known savings are compared first, then eligible pending offers, their explicit priority, like benefit magnitude and stable IDs. Percent vs fixed pending amounts cannot be monetarily compared; no best-price guarantee is claimed for that unknown portion. The snapshot communicates eligibility without inventing a discount amount or total.

### Deterministic calculation order and exact money

1. Derive canonical approved line prices and explicit participant/unit/booking quantity.
2. Apply activity/package promotions to their targeted line bases.
3. Apply booking promotions to remaining targeted subtotals.
4. Freeze subtotal, applied offers, exact discount and estimated total.

Within each stage: descending priority, then stable offer ID. Stacked percentages are **sequential**, not additive against the original subtotal. For example 10% followed by 20% on ฿200 gives ฿144, not ฿140. Fixed amounts are capped at the targeted remaining base; totals cannot be negative.

The project's THB `Money.amount` and display amounts remain available for compatibility. Decimal amounts with at most two fractional digits are converted exactly by decimal parsing, not binary float multiplication. New V3 lines also preserve exact `amountMinor`. Multiplication, summation, percentages, comparison and allocation use integer/BigInt minor units. Half-up percentage rounding occurs once per promotion's aggregate targeted base. Allocation floors proportionally per line; any remaining satang go in stable line-ID order. This defines repeatable later scoped discounts. Unsafe money/counts and excess precision cannot fabricate an estimate.

Promotion snapshots include exact `subtotalMinor`, `discountMinor`, `amountMinor`, and each applied `discountMinor`. Existing major-unit fields are presentation-compatible views; exact minor fields are authoritative, including at large numeric boundaries. THB UI displays no fractional digits when an amount is whole, and up to two when canonical amounts or exact rounding require satang. No made-up whole-baht rounding policy was introduced.

### Unknown pricing and restrained UI

One unknown selected line keeps the final estimate and whole subtotal pending. Booking discounts targeting an unknown base have a null discount amount, while truthful discount amounts on independently known scoped lines can be preserved. Eligibility can be communicated as a percentage or fixed offer label without a claimed numeric total. Invalid/non-bookable selections also cannot produce a partial total.

One inline polite status below selections communicates applied/eligible config-driven offers. Removal or date changes recalculate it without toast spam. Review shows the original subtotal and individual discount rows when known, followed by the estimated total and manager confirmation of final price **and availability**. Unknown amounts keep Manager to confirm. No sale banners, countdowns, strikethroughs, payment invoice or promo-code input is added. Labels and UI feedback support EN/RU/TH/ZH; IDs and calculation remain locale-independent.

### Server authority, persistence and idempotency

Client previews use the shared pure calculator and canonical public config. Browser clock previews are advisory; server receipt time always determines actual booking-date eligibility. Public POST validation strips forged totals, discount fields, promotion IDs and submission dates before repository creation. The server independently derives catalog prices, visit date, submission date and approved promotion config.

V3 estimate `version: 2` preserves base line amounts plus `promotions` containing calculation/configuration versions, server submission date, original subtotal, applied IDs, translation identifier/structured labels, scope, benefit, targeted line IDs, per-offer discounts and final total. The existing JSONB estimate column requires no migration. Legacy version-one/V2 snapshots stay readable unchanged.

PostgreSQL writes estimate, request/activity rows, outbox and delivery plans transactionally. Staff notification text includes frozen offers and totals. Stored reads never recalculate. Sequential replay reads the persisted result before evaluating current config; concurrent inserts still use the existing unique-key conflict/read-back path. Changed config or labels cannot change a same-key stored offer, even when the current config becomes invalid. A different request with the same key remains an idempotency conflict. No production database migration or provider send is part of this work.

### Validation

Focused synthetic tests cover multi-activity tiers, Restaurant exclusion, each package-count policy, weekday/visit/submission/active-window boundaries, combinations and targets, fixed/percentage money, scoped order/allocation, stackable/exclusive/best-only groups, explicit priority, unknown bases, exact arithmetic and validation limits. API tests cover forged client input and server time. In-process PostgreSQL tests cover frozen promotion JSONB/outbox snapshots, unchanged historical V2 data, invalid-config replay and rollback. React tests cover immediate eligibility/removal, pending total and multilingual known breakdowns. These do not constitute live business promotion approval, production provider acceptance or dedicated external PostgreSQL concurrency acceptance.

### Final submission authority and staff promotion context (requirements 92–100)

Client calculations are **preview only**. Public submissions contain canonical booking facts, not accepted client subtotal/percentage/discount/eligibility/offer IDs/total. The validated backend repository independently calculates prices and promotions using canonical config and server receipt time, immediately before persisting the estimate.

Each selected promotion now explicitly records `status: APPLIED` when its canonical discount is calculable, or `status: ELIGIBLE` when its targeted base remains unknown. The whole evaluation also preserves `pricingStatus: KNOWN | PENDING` and full ISO `calculatedAt`, in addition to configuration/calculation versions and all existing labels, scopes, benefits and exact amounts. A known scoped discount can be APPLIED while the whole booking remains PENDING. Previously persisted snapshots without these added metadata fields remain readable; notification presentation infers the status from their stored discount only, without reevaluating business rules or rewriting history.

The PostgreSQL transaction inserts the booking estimate and activity facts **before** reading back that stored V3 result. Staff notification text, outbox record and LINE/WhatsApp delivery plans are generated from this read-back. All records commit together; rollback leaves no partial booking or notification. Delivery processing starts only after repository success. Providers and transport planning never import or evaluate promotion config.

For fully known prices, staff see the subtotal, selected APPLIED promotion label and percentage/fixed benefit, exact discount, estimated total and explicit final-price/availability confirmation notice. These are estimates, not confirmed charges. Staff operational text uses the frozen English label; all four labels and optional translation key remain preserved in the snapshot.

For pending prices, staff see PRICING: Manager to confirm, the engine-resolved ELIGIBLE promotion label and benefit, and an instruction to apply that offer to its scope when confirming the final quote. No fabricated numeric whole subtotal/discount/total is emitted. A known APPLIED scoped offer on an otherwise pending request is marked already applied and must be retained rather than applied twice; whole discount and total remain pending. The manager does not need to determine tiers, weekdays, conflicts or BEST_ONLY selection. A fixed offer's stated configured benefit is not represented as a calculated discount against an unknown base.

Notification rendering uses only the frozen estimate; changing live pricing or promotion config cannot change its text or frozen delivery envelopes. Same-key replay returns the original timestamp, status, labels, benefits and amounts and creates no duplicate outbox/deliveries. Production offers remain empty and all notification examples are synthetic tests.
