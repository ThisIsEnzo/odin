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
