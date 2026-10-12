# Booking V3 packages and confirmed pricing

Baseline: `booking/simplified-request-flow` at `c999596458478013baced01f014641a26bd61433`; existing PR #4. Source recovered from GitHub commit/tree/blob APIs, including exact original text hashes. No old archives used. Binary resources unavailable through the UTF-8 connector are retained unchanged in the base Git tree. No merge, rebase, deployment or live notification send.

## Package selection

The old homepage CTA lost the package ID; the route passed an ID only as informational context. V3 draft/schema, estimate and persistence supported activities only. CTAs now carry the canonical ID, the form initializes a real package selection, and all three packages can be added/removed directly. Package components appear in Form and Review; Edit and submission retain them. Package-only requests are valid, empty requests are rejected, and malformed IDs, duplicate packages, missing/extra/reordered components and forged canonical quantities are rejected. Unknown client pricing fields are stripped.

Confirmed composition:

| Package | Components |
|---|---|
| All Inclusive | Horse Riding, ATV, Sauna |
| Adventure Day | ATV, Horse Riding |
| Couple Escape | Horse Riding for **2 riders**, Sauna |

Restaurant is absent from every canonical package. Couple Escape uses `guestCount: 2` in its Horse component, not duplicated display text. Other components retain the request model's one-guest/one-ATV baseline; these are request defaults, not an assertion of approved package capacity. Sauna arrangements, especially Couple Escape's Sauna guest count, still require business confirmation.

Package durations are absent by default. Guests may request an existing approved activity duration or leave it pending; no shortest-tier duration is inserted automatically. A configured package duration initializes the selection and locks that component's duration control.

## Pricing and business inputs

| Activity | Confirmed tiers (THB) | Billing |
|---|---|---|
| Horse | 60: 1200; 90: 1600; 120: 2000 | Per rider; 2 × 90 = 3200 |
| Pony | 60: 600; 90: 800; 120: 1000 | Per rider |
| ATV | 30: solo 600 / shared 900; 60: solo 1000 / shared 1500 | Occupancy per ATV |
| Sauna | 60: 600; 90: 800; 120: 1000 | **Pending**, never multiplied by guests |

ATV validates `ceil(guests / 2) <= vehicles <= guests`. Shared vehicles = guests − vehicles; solo vehicles = 2 × vehicles − guests. For 5 guests, 30-minute totals are 2400 / 2700 / 3000 for 3 / 4 / 5 vehicles. Five guests with three ATVs at 60 minutes = 4000. Unknown 90/120-minute ATV prices remain pending and cannot be submitted as approved durations.

Horse/Pony 90/60 kg limits remain information on V3 cards; no weight input was introduced.

The existing fixed-price package architecture is preserved as explicit `pricingMode: fixed`. No fixed package price has been confirmed. Legacy mock amounts were removed; internal zero placeholders are marked mock and never rendered or billed as zero. All production packages remain Manager to confirm. Explicit `sum_components` support is available for future approved configuration and tested; switching to it is a business decision. Component totals remain pending whenever any billing basis/duration is unknown; no partial grand total is fabricated.

Package `discountPercent` is config-driven. Null/undefined/zero produces no discount row or badge. Positive discounts are exact basis-point offers scoped to the package, passed through the existing planner alongside general promotions. Default policy is **EXCLUSIVE**; `discountStacking` and optional `discountStackingGroup` can explicitly select STACKABLE or BEST_ONLY. This preserves conflict groups, best-price selection and sequential percentage arithmetic instead of automatically combining matches. A losing package offer does not produce a misleading discount row. Production percentages remain zero because no percentage was confirmed. Positive percentages and approved fixed/component prices are synthetic test/browser fixtures only.

Remaining business inputs: approved fixed package prices (or explicit approval for component-sum mode), actual package discount percentages and stacking policy, approved/default package component durations and quantities, Sauna billing basis and package guest arrangements.

## Authority, persistence and notifications

V3 adds optional `packages: [{packageId, components}]`. The API validates canonical structure/counts; calculation re-expands canonical components and accepts only valid requested duration facts. Client amounts, eligibility and promotion IDs are never authoritative.

Backend recalculates immediately before persistence. Existing immutable estimate/outbox snapshots now include package IDs, composition, counts, durations, pricing mode, base amounts and separate package discount results. The general promotion snapshot keeps combined subtotal/discount/final totals and general promotion results. Exact integer money arithmetic and server submission dates are preserved.

Additive migration **0003_petite_xavin.sql** adds nullable `bookings.request_packages` JSONB. Old migrations and V2 stored shapes are unchanged. Apply this migration before deploying the updated API. PostgreSQL inserts package-only requests without attempting an empty activity insert. Stored read-back produces the staff outbox and delivery plans inside the same transaction. Idempotent replay returns the original snapshot before recalculating mutable config.

Staff text includes package name/ID, included activities, counts, ATV units, requested/pending durations, package discounts, general promotions and known/pending total. Standalone ATV messages also include frozen solo/shared quantities and amounts. LINE/WhatsApp providers remain transport-only; no provider code changed.

## Verification

- `npm test`: **296 passing**, 14 files; includes 34 confirmed-price/package cases, 30 React cases, package-only PostgreSQL-engine round-trip/discount/outbox/replay and historical V2 migration compatibility.
- `npm run typecheck`: passed.
- `npm run build`: passed, webpack production build.
- `python scripts/check_i18n_parity.py`: **329 keys**, EN/RU/TH/ZH parity.
- `git diff --check`: passed.
- Chromium **153.0.8010.0**, 65 checks: 390/1440 widths, Horse/Pony/ATV/Sauna, known and pending totals, three package selections/remove/Edit/Review, canonical payloads, four locales, positive package discount fixtures, API receipt and server discount snapshots, no horizontal overflow or page exception.

Browser limits: the cloud browser and local subprocesses could not reach the workspace Next server over localhost. Therefore Chromium rendered the actual BookingFlow + NextIntl + generated production CSS in an isolated harness. Submissions were intercepted and routed to the **real createBookingHandler and InMemoryBookingRepository**, with no live transport. This verifies real browser interaction and backend calculation, not Next routing/HTTP deployment integration. Unavailable photography produced expected 404s. Mobile package Review and desktop known-price Review screenshots were visually inspected. Header/footer imagery, route-level staging, physical devices, Safari/Firefox and dedicated PostgreSQL concurrency were not certified by this pass. Existing PR merge conflicts remain untouched.
