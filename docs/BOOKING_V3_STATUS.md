# ON GROUND — Simplified booking request V3

## Delivery

Separate stacked branch: `booking/simplified-request-flow` → `brand/on-ground-khao-mai-kaeo-refresh`. Parent verified at `9729ac0d52357b0ec3da49aa64bb046eb273e14d`; parent Draft PR #3 was open/unmerged. No merge, main rebase, deployment or change to PR #3's scope.

GitHub is the source baseline. Fresh source/small assets were recovered via connector and verified against Git blob hashes; exact parent tree, clean status, 15 commit history and main-to-brand diff were inspected before branching. Direct git clone had no available credential. The connector returned empty contents for 13 unchanged photos over 1 MB, so those paths remain absent in a sparse local worktree while their exact hashes stay in the Git index/remote tree. No old ZIP archives or previous local source were used.

## Result

One form → one Review → Send booking request → Request received. Form includes one visit date, one preferred arrival time, full name/email/phone, dynamic editorial activity cards and one optional comment. Review groups visit/contact/numbered experiences/notes/estimate; Edit preserves all fields. No wizard, cart/sidebar, separate activity times, nested package editor or weight inputs remain in the public flow.

Horse/Pony maxima remain 90/60 kg in canonical restrictions, cards, review and staff text. Metadata controls generic per-person/group/capacity-unit behavior. ATV max capacity is two guests/unit; five guests can choose three/four/five ATVs. Server and client share validation; future fifth catalog activity appears without a BookingFlow edit. Restaurant is not a duration card.

Approved duration/price arrays remain empty, so duration and price are Manager to confirm. Architecture accepts real tiers once supplied. Explicit participant/unit/booking quantity bases support per-person, per-vehicle and fixed group quotes without guessing. Any unknown selected line makes the total pending. Global arrival preference is not an individual slot; obsolete sequence/closing-duration assumptions do not reject V3.

Public API accepts explicit schemaVersion 3 only. V2 model/rules/repository reads remain historical. New additive migration `0002_deep_wonder_man.sql` adds visit columns and count activity rows without editing 0000/0001 or destroying participant data. New requests create no participant rows. Server estimate, booking/activity counts, canonical outbox and frozen plans commit atomically; existing idempotency/retries/LINE/WhatsApp transports remain intact.

Mock packages are excluded from the core builder. Homepage package CTAs now say Plan a visit and open the plain activity form. Valid old package deep links show a truthful context note, no preselected fabricated composition. Customer outbound message delivery is not yet configured: no email/SMS/customer WhatsApp send is simulated. The on-screen thank-you and API reference are supplied professionally in EN/RU/TH/ZH.

## Verification

- `npm test`: 200 passing tests, 10 files. Includes 16 React request-flow cases and 35 V3 rule/estimate cases.
- `npm run typecheck`: passed.
- `npm run build`: passed (Next.js production build).
- `python scripts/check_i18n_parity.py`: 320 identical keys in EN/RU/TH/ZH.
- `git diff --check`: passed.
- In-process PostgreSQL engine: migrate over a pre-existing V2 record with weight/date/time/duration; V3 count round trips; frozen estimate after catalog edits; idempotent replay/conflict; outbox equality; rollback and constraints.
- API: no-weight riding plus ATV capacity; server rejects invalid capacity/unknown catalog/invented duration; client prices stripped; V2 public payload rejected; safe persistence errors and idempotent acceptance retained.
- React: all five fields on one form, explicit selection/removal/reset, flexible ATV counts, approved duration validation, preserved Edit, four locale form/review renders, future fifth generic service, request receipt/reference, repeated-send guard, same-intent retry/new-key edit and server-error correction.
- No real booking/provider message sent. No production database accessed or migrated.

## Review gaps and release requirements

Browser automation is unavailable in this managed environment, so visual screenshots, pixel overflow/focus geometry and mobile browser interactions at 375/390/430px are **not verified**. jsdom covers semantics/interaction, not actual layout. CSS uses one column below 1024px, independent two-column desktop cards, wrapping controls, 48px steppers and 52px inputs, with no sticky overlay/carousel. Review the new UI in a real browser before release. Parent brand browser evidence does not verify the new Booking design.

No dedicated real PostgreSQL test database is configured here. Real-PostgreSQL integration cases now include V3 round-trip/concurrent same-key/new-connection behavior but were not run. In-process PostgreSQL tests do not prove external DB concurrency, restart/network/provider behavior. Existing lint configuration issue is outside this PR; lint is not claimed passing.

Before application deployment: back up, apply additive migration in staging, run the dedicated DB suite, review mobile/desktop UI, then apply approved production migration and deploy frontend/API together. Public V2 clients receive validation failure rather than silent reinterpretation. Customer outbound delivery and approved activity/package pricing remain future configured work.

Final ON GROUND wordmark/horse/material/Header/Footer/Location map and existing homepage architecture are preserved. No new dependency or production price tier is introduced. See BOOKING_RULES.md, DATA_MODEL.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, UI_UX_AUDIT.md and PRODUCTION_BACKEND_SETUP.md.

## Config-driven promotion extension

V3 server estimates now include a version-two frozen promotion snapshot, exact minor-unit fields, config/calculation versions and translated offer labels. One canonical validated engine supports booking/activity/package scope, explicit package-count policy, combinations, Thailand visit/submission calendar conditions, active windows, percentages/fixed benefits and deterministic stackable/exclusive/best-only resolution. Shared previews provide restrained inline eligibility and Review breakdowns. PostgreSQL replay reads the stored result before evaluating mutable configuration, while retaining the concurrent unique-key conflict path.

Production promotion config is empty: no client-approved offers, sample discounts, new packages or price tiers are activated. Synthetic examples live only in tests. Existing V2 records/migrations, outbox/provider transports, parent PR scope and stacked base remain unchanged. Full semantics are in `BOOKING_V3_SIMPLIFIED_FLOW.md`.

Promotion-extension validation: 245 tests passed across 12 files, including 37 engine cases, forged-input/server-clock API cases, a PostgreSQL-engine frozen snapshot/outbox/invalid-config replay case and five additional multilingual React feedback/breakdown cases. TypeScript, production build and 323-key EN/RU/TH/ZH parity passed. Dedicated external PostgreSQL concurrency, production providers and pixel-level mobile/browser acceptance remain the review gaps described above.

## Final server authority and notification clarification

Requirements 92–100: promotion snapshots now explicitly preserve APPLIED/ELIGIBLE status, whole-pricing KNOWN/PENDING status and ISO calculation timestamp. V3 staff notifications render from the transactionally persisted booking read-back. Known quotes show the benefit and exact discount; pending quotes show the engine-selected benefit and manager instruction without fabricated whole totals. LINE/WhatsApp providers retain transport-only behavior, and original frozen results/delivery plans survive config changes and idempotent replay. Legacy snapshots remain readable without rewriting. No sample offer enabled.

Validation for this clarification: 252 tests pass across 13 files, including six staff notification/transport-envelope cases and one additional PostgreSQL-engine pending snapshot/outbox/replay case. TypeScript, production build, translation parity and diff checks pass. The existing external PostgreSQL, live provider, browser-layout and inherited lint limitations remain unchanged.


## Final navigation and pricing UI QA — 2026-10-12

Recovered directly from GitHub HEAD `fd34f1c5a59f87828a9c65f865994866649c3cf1`;
no prior archive or uncommitted implementation was used. PR #4 currently targets
`main` and is Ready for Review. Existing merge conflicts were not changed.

- Header navigation uses deliberate spacing, a tonal hover/press background and
  no click underline. Keyboard focus retains a visible 2px outline. A semantic
  dark-on-terracotta text token improves contrast without changing the logo,
  terracotta plaster surface or official artwork.
- Header, mobile menu and Footer share one native select with a bottom rule and
  chevron. Chromium treats native selects as focus-visible after pointer clicks;
  explicit pointer/keyboard state removes only the pointer outline. Keyboard
  interaction restores the visible outline. Native popups remain OS controlled.
- Confirmed offer prices have a separate Starts from label, large number and unit.
  Mobile commercial facts stack to avoid splitting currency amounts. Mock catalog
  prices remain Manager to confirm; no price or promotion was approved here.
- Booking form and Review share a presentation-only estimate with subtotal,
  configured offer status/percentage, known discount and prominent estimated total
  followed by the manager disclaimer. Eligible unknown-price offers have no
  fabricated deduction. Gold offer tokens are restrained and high contrast.
  Canonical preview and backend-authoritative calculation are unchanged.
- Location copy in EN/RU/TH/ZH adds Khao Mai Kaeo countryside/activity/dining
  context instead of repeating 20 km. The duplicate external button was removed;
  the verified iframe and canonical Maps config URL are unchanged. The supplied
  client screenshot shows the iframe's Open in Maps action. Google iframe
  interaction was unavailable locally, so its mobile/keyboard behavior is not
  independently certified by this QA.

Validation: 252 tests in 13 files, typecheck, `npm run build`, 324-key translation
parity and diff whitespace check pass. Existing UI assertions now check the
separate semantic subtotal/offer/discount elements and ensure eligible offers
have no numeric deduction. The build script explicitly uses Next's supported
webpack compiler: default Turbopack failed in its existing Google font resolver
(`next/font/google queries have exactly one entry`). No font/dependency change.
Inherited ESLint FlatCompat circular-config serialization failure remains.

Clean Chromium 153 with a fresh context and extensions disabled checked all
375/390/430/768/1024/1280/1440 widths in all four locales. Homepage, menu,
Header/Footer controls, Booking and Review have no horizontal overflow; mouse
navigation has no underline; pointer select has no outline; keyboard navigation
and both selects retain a 2px focus indicator. Real presentation components were
also rendered with isolated known/pending 10% test fixtures at 390/1440 in all
four locales. These fixtures are not production config and were not committed.
No booking was sent.

Hydration: no application hydration warning or page exception in clean development
or production Chromium; no `data-sharkid` attribute and no source occurrence.
Controlled server-HTML insertion retained the attribute but did not reproduce the
client's warning in this runtime. The screenshot is consistent with external DOM
mutation, commonly a browser extension, but the specific extension and exact
original cause are not confirmed. No suppression/attribute-stripping workaround.

Recovery limitation: 13 photography binaries exceed the connector's contents
limit. All available recovered files were Git-blob hash checked; the unavailable
photos are preserved unchanged through the original remote base tree. Screenshots
verify typography/layout/official logo assets, not complete photography rendering.
Google Maps content and physical devices/Safari/Firefox were not certified.
