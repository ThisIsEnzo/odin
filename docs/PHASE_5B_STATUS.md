# Phase 5B — Booking V2

## Status

PARTIAL

Booking V2 implementation and completion documentation are complete. Automated verification passed as detailed below; interactive browser/responsive verification remains externally blocked, not a demonstrated application failure. No Phase 5C work has begun.

## Booking V1 → V2

The single-experience form/API is replaced by a versioned, multi-item visit. Customer details are collected once; every activity has its own schedule and participants. Old V1 POST bodies are deliberately rejected rather than guessing individual riding weights. Legacy homepage query links remain supported.

## Domain model

- `BookingRequest`: schemaVersion 2, customer, locale, notes, items; server-owned ID, createdAt and initial `received` status.
- `BookingItem`: discriminated activity/package union with stable IDs.
- Participants: local to each activity, stable IDs, optional individual weight. Count is derived from the array. No guest names or assumed cross-activity identity.
- Packages: canonical package ID plus explicit activity components, each independently configured. Restaurant inclusion is derived from existing data and arranged with staff. Existing mock package flags remain explicit.
- Options/add-ons: data-driven definitions and quantity selections with applicability validation. The production catalog is empty; no fictional add-ons are offered.

See DATA_MODEL.md for compatibility and modeling decisions.

## Booking capabilities

Multiple activities, different dates/times and counts per activity, per-rider limits, package initialization and package plus standalone activities are implemented. Edit/remove/duplicate preserves unrelated items. Duplicate IDs are regenerated. Review groups by date and retains package context. Contact is collected once; errors identify the activity and participant. Confirmed operating hours and 90 kg horse / 60 kg pony limits are unchanged. ATV/Sauna do not request weights. No invented durations, availability guarantees or totals.

## Notification architecture

Domain types are independent from payload formatting and provider transport. `buildBookingNotificationPayload` produces one complete snapshot and staff text containing every item/component, schedule, count, weight, option, contact and note.

`NotificationProvider` adapters are composed by `FanoutNotificationService`; one failing provider does not prevent other attempts. Console is the local default, logging only reference/count/status, with no external delivery.

LINE boundary: official Messaging API push endpoint, configured bearer token and staff recipient, bounded message chunks. No LINE Notify.

WhatsApp boundary: official Business Cloud API with explicitly configured API version, phone number ID, recipient and approved template. No unofficial libraries or WhatsApp Web automation. Template approval, recipient opt-in and real credentials are required before enabling it.

`.env.example` contains blank provider credentials and `BOOKING_NOTIFICATION_CHANNELS=console`. There are no hardcoded production secrets or fabricated production channel IDs. Test-only credentials/recipients are confined to mocked HTTP fixtures. Live LINE/WhatsApp delivery was not tested.

## Persistence behavior

Validate → persist → attempt notifications → return HTTP 201 `received`.

`submitBooking` catches notification-service failures after creation. The stored request remains available and notification failure does not become a customer-facing submission failure. Persistence failures return a generic API error. Repository input/output is cloned to prevent external mutation. Storage remains a volatile, process-local development Map; no production DB was added. Notification attempts are synchronous and bounded per transport request; no durable outbox/retry guarantee exists yet.

## Compatibility

All four canonical `?experience=` links and three `?package=` initializers are covered by tests. A package is initialized with all configured components; `?package=...&experience=...` adds a standalone item. Homepage markup, anchors, booking links, layout and visual assets retain Phase 5A.1 without redesign.

## I18N

EN/RU/TH/ZH have matching structures: `python3 scripts/check_i18n_parity.py` passed with 222 keys across all four locales. Booking V2 labels/errors are localized. Existing translations were preserved. This establishes structural parity, not a visual review of text wrapping or an independent linguistic review.

## Verification

### PASSED

- Earlier checkpoint: 77 tests passed. Final pre-interruption suite: **83 tests passed in 4 files**, including 6 additional API tests. No application code changed during the final documentation/packaging continuation, so this suite was not needlessly rerun.
- `npm test`: 24 rule tests, 15 schema tests, 38 Booking V2 tests, 6 API tests. Coverage includes multiple activities/dates/times/counts, individual weights, package initialization and extras, edit/remove/duplicate, canonical legacy links, unknown/tampered data, received semantics, complete notification payload, persistence before notification and notification-failure isolation; provider calls use mocked HTTP.
- `npm run typecheck`: passed. Baseline booking type errors in the touched/migrated code no longer block this result.
- `npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=30000`: succeeded. package.json and package-lock.json were restored to their exact uploaded baseline bytes; no dependency rewrite is shipped.
- `python3 scripts/check_i18n_parity.py`: passed again during final continuation, 222 keys in EN/RU/TH/ZH.
- QA-only `NEXT_FONT_GOOGLE_MOCKED_RESPONSES=<external QA fonts.cjs> npm run build -- --webpack`: exit 0; compilation, TypeScript, 11/11 static pages, page optimization and traces completed. This used local QA font fixtures outside the project, not disabled type checking. The hook and fixtures are excluded from the archive. This is not a claim that the stock build passed.
- Final baseline comparison: existing homepage/layout components, canonical business-data files and public images are byte-identical. Package manifests unchanged. New options catalog is empty.
- Final clean archive: CRC checked and each archived file byte-compared with the final working source. Required V2 files, documentation, locale files, production images/logo and .env.example included; generated/cache/upload/recovery archives excluded.

### BLOCKED / ENVIRONMENTAL

- Browser preview: original failure and one final reasonable navigation retry returned `net::ERR_BLOCKED_BY_CLIENT`. No Phase 5B browser interactions or responsive widths are claimed as verified.
- Final live HTTP render/API smoke attempt could not complete in this environment (connection refused across sessions, then timeout with a same-process server). No successful four-locale HTTP render or live HTTP API result is claimed. The six direct route-handler tests passed as above.
- Stock `npm run build` failed in the Google Fonts/Turbopack virtual font-module path. Unmocked `npm run build -- --webpack` also failed in next/font Google loading. Only the explicit offline-font QA build succeeded.
- `npm run lint`: existing FlatCompat circular-serialization configuration failure; configuration unchanged.
- `npm ci`: pre-existing package-lock/package.json mismatch. npm install succeeded, but its incidental lockfile rewrite is not shipped.

## Scope integrity

No CRM, admin, payments, production database, inventory locking or instant confirmation. No invented business data, real add-ons, package details, hours, age limits or durations. Request creation still means `received`. Booking form/API, validation, repository cloning and notification composition changed only as needed for Booking V2. Homepage design, existing business facts and integrated visual assets were not changed. Temporary recovery files, screenshots, logs, caches and source upload archives are not project deliverables.

## Remaining Phase 5C work

- Complete interactive desktop/mobile and four-locale browser QA in an accessible preview environment before release.
- Select and implement durable transactional persistence behind the repository contract.
- Add atomic notification outbox, delivery records, retries, provider receipts/webhooks and reusable retry keys.
- Add submission idempotency, distributed abuse controls, monitoring and data retention/access policy.
- Configure real approved staff channels and test LINE/WhatsApp delivery with authorized credentials and recipients.
- Define real durations/capacity/participant identity before conflict or availability logic. Verify business mock values before production use.
- Resolve inherited tooling/font environment limitations separately; no broad tooling refactor was attempted here.
