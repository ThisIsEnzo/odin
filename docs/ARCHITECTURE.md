# ODIN — Architecture

Current implementation: Booking V3 on the existing PostgreSQL/Drizzle transactional outbox infrastructure. V2 remains explicitly readable as historical data.

## Application and public booking

Next.js App Router, React/TypeScript, Tailwind and next-intl retain the final ON GROUND brand parent. Public booking is V3: one form → Review → Send request → Received. The form holds global visit date/preferred arrival, contact, catalog-driven activity cards and one optional note. No wizard, cart/sidebar, individual start times, participant weights or nested package editor remains in the public UI.

`booking/request.ts` owns the V3 schema, generic capacity bounds, selection helpers and estimate calculation. React and the API share it; the server always verifies against its canonical catalog. `RequestActivityCard` renders generic behavior metadata, so a fifth bookable activity needs no BookingFlow edit. The thin book route still initializes valid activity deep links. Existing valid package deep links show context only; homepage package CTAs lead to a plain activity form because package rules remain mock.

`types/domain.ts` keeps V2 historical types and adds V3 plus explicit version unions. `validation/booking.schema.ts`, itinerary/rules and V2 estimates remain compatibility/domain tools; they are not the active public POST shape. Retired wizard React components are removed. See BOOKING_RULES.md and DATA_MODEL.md for policy/version details.

## Persistence and submission

The active `/api/booking` validates V3 and the UUID Idempotency-Key, strips client price data and delegates to the existing runtime/repository boundary. V3 uses global booking columns and a separate count-based activity table, not synthetic participant records. The additive `0002` migration preserves existing applied migrations and all V2 records. Reads discriminate explicitly by schemaVersion. Full name maps to the existing customer_name column.

The existing transaction computes a canonical estimate and commits booking, ordered activity counts, immutable snapshot, one outbox event and frozen delivery plans. Same key/content returns the original aggregate/reference/price; conflicting content returns 409. Unique PostgreSQL keys retain concurrent protection. The client guards double clicks and retains the key for unchanged retries. Receipt requires committed acceptance; configuration/persistence errors return safe 503. Notification failure after commit cannot reverse acceptance.

The server's estimate is authoritative. An explicit participant/unit/booking basis determines quantity; no mock rates or per-person/per-vehicle assumptions are promoted. Any pending line makes the total pending. Global preferred arrival is not an individual slot or schedule, so old closing/duration sequence assumptions do not gate V3. V2 interpretation remains intact.

`runtime.ts` still chooses PostgreSQL by default and disallows memory/console in production. No automatic migration on startup, payment, inventory lock, instant confirmation, account or hosting-provider rewrite is introduced.

## Notification layers

- Canonical interpretation: `booking/notify.ts`, with version-aware snapshots/text. V3 includes visit preference, contacts, activity guest/unit counts, duration, informational riding maxima, notes and estimate. Historical V2 interpretation remains available.
- Planning: `outbox/plan.ts`, immutable per-recipient/per-part transport envelopes; no credentials in persisted plans.
- Transport: `outbox/transport.ts` and shared `providers/http.ts`, official endpoints, current server-only tokens, bounded timeout and sanitized failure categories.
- Processing: `outbox/processor.ts`, durable state, DB locking, retries and per-part acceptance IDs.
- Phase 5B direct provider classes / fanout / submit helper remain compatible for tests, but are not the production submission path.

The scheduler uses authenticated POST `/api/internal/notifications/process`. A strong server-only bearer secret is compared through fixed-length hashes and timingSafeEqual. Processing claims an event using FOR UPDATE SKIP LOCKED and holds its transaction over exactly one bounded provider call. Different events can progress concurrently; two workers do not send the same event concurrently. No lease expiry can overtake an in-flight call. Pool and idle-transaction timeouts must exceed the HTTP timeout as documented.

Each part has its own attempts, next-attempt time, last sanitized error, sent timestamp and provider ID. Successful parts remain sent; event status aggregates to pending/sent/partial/dead. Six attempts with exponential backoff bound committed failures. Transport errors, 408, 429 and 5xx retry; other 4xx become dead. The endpoint caps each run at five parts, checking a 45-second deadline between attempts.

LINE: official push API, persisted retry UUID reused with frozen body/destination, accepted 409 detection, conservative 23h event age cutoff. WhatsApp: official Cloud API with configured API version and approved BODY template, explicit recipient opt-in, no assumed customer-service window and no unofficial automation. API acceptance is not end-user delivery. WhatsApp ambiguous sends/crashes may duplicate; this is not exactly-once transport. A transaction rollback after a crash also rolls back the current attempt counter. Operator monitoring/recovery is required.

No webhook is necessary for outgoing LINE; this phase exposes none. WhatsApp delivery receipts and automatic opt-out ingestion are not implemented. See NOTIFICATION_SETUP.md for official references, approval constraints and setup; see PRODUCTION_BACKEND_SETUP.md for scheduler, TLS, migration locking, DB roles, backup and retention guidance.

## Verification and remaining boundaries

See BOOKING_V3_STATUS.md for this stacked PR’s actual results and remaining review gaps. Historical infrastructure results remain in PHASE_5C_STATUS.md. Real PostgreSQL integration tests are provided and fail closed without a dedicated test DB. Unit tests use mocked transports. No live provider success is claimed without credentials and recipient confirmation. New Drizzle/pg/tsx dependencies require an updated lockfile; npm ci dry-run validates it. The inherited ESLint configuration remains out of scope. Homepage/layout/brand assets remain unchanged apart from truthful package CTA behavior/copy. Catalog gains booking metadata without changing restrictions/hours/mock prices; localized V3 copy is supplied across four locales.

No CRM, admin, customer authentication, payments, availability engine or instant confirmation. Before launch complete real DB/migration/concurrency/restart verification, account setup and live provider tests, existing browser QA, scheduler operations, upstream rate limiting and data-retention policy.

Only staff LINE/WhatsApp delivery is configured. Customer outbound message delivery is not yet configured; the browser receipt is the customer thank-you. No email/SMS/customer WhatsApp send is simulated.
