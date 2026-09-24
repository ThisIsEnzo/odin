# ODIN — Architecture

Current implementation: Phase 5C infrastructure on the supplied Phase 5B Booking V2 project. Earlier greenfield proposals are superseded by the actual modules described here.

## Application

Next.js App Router, React/TypeScript, Tailwind and next-intl. Locale prefixes EN/RU/TH/ZH remain unchanged. Homepage/layout components, styling and assets retain Phase 5A.1. Canonical business facts remain in `src/data/odin`, display copy in `messages`. The booking route is a thin initializer for canonical `?experience=` and `?package=` links. Both parameters together add the package and a standalone experience deliberately; invalid IDs are ignored by initialization and rejected at the API boundary.

## Booking layers

| Layer | Responsibility |
| --- | --- |
| types/domain.ts | Versioned request, activity/package union, participants, option definitions/selections |
| booking/itinerary.ts | Stable-ID creation, independent edit/remove/duplicate, package initialization |
| booking/rules.ts | Central business validation and data-driven scheduling helpers |
| validation/booking.schema.ts | Structural validation; delegates all V2 business rules |
| domain/booking/BookingFlow.tsx | Choose → configure → contact → review → received |
| ActivityEditor.tsx | Per-activity schedule and per-participant inputs |
| BookingOptions.tsx | Catalog-driven future option controls; currently hidden |
| api/booking/route.ts | Server validation, bounded request, dependency wiring |
| booking/api.ts + runtime.ts | V2 validation, idempotent repository creation and immediate outbox attempt |
| booking/repository.ts + postgres-repository.ts | Repository contract, explicit dev memory and transactional PostgreSQL |
| booking/notify.ts | One complete operational payload, fanout and delivery outcomes |
| booking/providers/* | Official provider transport only |

Review groups activities by date and retains package context. Each activity can be edited without clearing others. Only one top-level item's editor is open at once; package components are configured explicitly. Contact is collected once. Error summaries identify activity and rider. No guest names, invented prices, durations, add-ons or total charges are introduced.

## Production persistence and submission

`src/lib/db/schema.ts` defines six normalized PostgreSQL tables with Drizzle ORM. `PostgresBookingRepository` retains the BookingRepository abstraction and reconstructs the canonical Booking V2 aggregate. Internal UUIDs, public references and frontend item IDs are separate. The public reference is ODIN plus 128 random bits with a unique DB constraint.

The API validates V2 and the Idempotency-Key UUID header. The repository hashes a canonical representation of the validated draft and inserts under a unique key inside a transaction. An identical replay returns the original result; changed content returns 409. Concurrent submissions rely on the PostgreSQL unique constraint, not a process-local check. Client retries retain their key while submitted content is unchanged; editing changes the key. A remount/new form begins a new intent.

The transaction writes booking, ordered items/components, ordered participants/options, one canonical outbox event and frozen provider/recipient/part deliveries. Any failure rolls everything back. The response is received only after commit; one immediate delivery part is attempted best-effort, with a scheduled processor completing remaining work. Notification or processing failures cannot turn committed acceptance into a booking error. Missing production configuration returns a safe 503, never a memory success.

`runtime.ts` selects PostgreSQL by default and rejects memory/console in production. Explicit development memory remains for frontend work and isolated tests. `backend:check` is the documented pre-start validation gate; build-time module loading does not open the DB. There is no hosting-provider SDK, automatic migration on startup, inventory lock or new status transition.

## Notification layers

- Canonical interpretation: `booking/notify.ts`, reused from Phase 5B. Full snapshot plus operational text, no outgoing internal IDs.
- Planning: `outbox/plan.ts`, immutable per-recipient/per-part transport envelopes; no credentials in persisted plans.
- Transport: `outbox/transport.ts` and shared `providers/http.ts`, official endpoints, current server-only tokens, bounded timeout and sanitized failure categories.
- Processing: `outbox/processor.ts`, durable state, DB locking, retries and per-part acceptance IDs.
- Phase 5B direct provider classes / fanout / submit helper remain compatible for tests, but are not the production submission path.

The scheduler uses authenticated POST `/api/internal/notifications/process`. A strong server-only bearer secret is compared through fixed-length hashes and timingSafeEqual. Processing claims an event using FOR UPDATE SKIP LOCKED and holds its transaction over exactly one bounded provider call. Different events can progress concurrently; two workers do not send the same event concurrently. No lease expiry can overtake an in-flight call. Pool and idle-transaction timeouts must exceed the HTTP timeout as documented.

Each part has its own attempts, next-attempt time, last sanitized error, sent timestamp and provider ID. Successful parts remain sent; event status aggregates to pending/sent/partial/dead. Six attempts with exponential backoff bound committed failures. Transport errors, 408, 429 and 5xx retry; other 4xx become dead. The endpoint caps each run at five parts, checking a 45-second deadline between attempts.

LINE: official push API, persisted retry UUID reused with frozen body/destination, accepted 409 detection, conservative 23h event age cutoff. WhatsApp: official Cloud API with configured API version and approved BODY template, explicit recipient opt-in, no assumed customer-service window and no unofficial automation. API acceptance is not end-user delivery. WhatsApp ambiguous sends/crashes may duplicate; this is not exactly-once transport. A transaction rollback after a crash also rolls back the current attempt counter. Operator monitoring/recovery is required.

No webhook is necessary for outgoing LINE; this phase exposes none. WhatsApp delivery receipts and automatic opt-out ingestion are not implemented. See NOTIFICATION_SETUP.md for official references, approval constraints and setup; see PRODUCTION_BACKEND_SETUP.md for scheduler, TLS, migration locking, DB roles, backup and retention guidance.

## Verification and remaining boundaries

See PHASE_5C_STATUS.md for actual results. Real PostgreSQL integration tests are provided and fail closed without a dedicated test DB. Unit tests use mocked transports. No live provider success is claimed without credentials and recipient confirmation. New Drizzle/pg/tsx dependencies require an updated lockfile; npm ci dry-run validates it. The inherited ESLint configuration remains out of scope. Homepage/layout/business data and locale content remain unchanged.

No CRM, admin, customer authentication, payments, availability engine or instant confirmation. Before launch complete real DB/migration/concurrency/restart verification, account setup and live provider tests, existing browser QA, scheduler operations, upstream rate limiting and data-retention policy.
