# Phase 5C — Production Persistence & Notifications

## Status

PARTIAL

Implementation, migrations, automated unit/API/provider checks, setup documentation and packaging are complete. Production sign-off remains pending real PostgreSQL integration/migration/concurrency/restart verification and live provider/account setup. No missing infrastructure check is represented as a pass. Phase 5B browser QA also remains open; the homepage was not redesigned or re-audited.

## Database architecture

PostgreSQL with Drizzle ORM and node-postgres, ordinary DATABASE_URL, no provider SDK coupling. Canonical Booking V2 is reused. Explicit development memory is allowed only outside production and only with console. Missing production DB/channel/processor configuration fails safely, never falls back to memory. Initialization is lazy; use the documented `backend:check` pre-start gate. No production credentials, database or migration were available/used.

## Schema / migrations

Six tables: bookings, booking_items, booking_participants, booking_item_options, notification_outbox, notification_deliveries. Ordered normalized children reconstruct the original aggregate, including package hierarchy and per-rider weights. JSONB is restricted to immutable notification snapshots/envelopes. UUID internal keys and independent random public references have DB uniqueness constraints. Same-booking parent FK, item shape, quantity/weight and ordering constraints supplement shared application validation.

Committed migration: `drizzle/0000_massive_gabe_jones.sql`, snapshot and journal. Scripts: db:generate, db:migrate, db:status. Migration runner uses a dedicated connection and advisory lock. SQL generation and no-drift regeneration passed; actual application to PostgreSQL is NOT verified here.

## Repository

PostgresBookingRepository implements the existing repository contract. One transaction writes the entire booking aggregate, canonical received event and all planned deliveries. Failure rolls back all writes. Readback reconstructs domain IDs and ordering without exposing row IDs to customer UI or staff messages. Production status on creation remains received.

## Idempotency

Client UUID Idempotency-Key per unchanged submitted content; changed content generates a new key. PostgreSQL unique key + canonical SHA-256 request hash handles races. Same key/content returns the original booking/reference; incompatible reuse returns HTTP 409. Public reference: `ODIN-` plus 128 random bits, unique-constrained; internal UUID remains separate. A remount/new form is a new intent. Server failures use safe HTTP 503 without SQL/secrets.

## Transactional outbox

Booking, event and per-provider/recipient/part delivery plans are committed together. The canonical Phase 5B formatter remains authoritative. Plans freeze body, target and transport settings without tokens. Every part retains its own status, attempts, sanitized error, scheduling and provider acceptance ID. Sent work is never requeued merely because another provider failed. Event aggregation distinguishes pending, sent, partial and dead.

## LINE provider

Official Messaging API push endpoint and bearer token. Frozen body/destination and retry UUID are reused; a 409 with accepted-request ID acknowledges prior acceptance. One bounded text message per durable part. Conservative 23-hour event-age cutoff prevents automatic reuse beyond the documented retry-key period. Configurable staff user/group destinations; no fake defaults and no LINE Notify. No webhook/chatbot is needed for outgoing push; verified external discovery of group IDs is documented. Live acceptance/recipient delivery NOT verified.

## WhatsApp provider

Official Cloud API, explicitly configured Graph version/phone-number ID, approved positional BODY template and opted-in individual recipients. No free-form-window assumption, group API claim, unofficial library or Web automation. Three parameters carry public reference, part number and up to 700 UTF-16 units of operational details. Proposed exact template specification and account/approval steps are documented; approval is NOT claimed. Each part records Meta's message ID on acceptance. Live delivery NOT verified; credentials, consent and actual approval required.

## Retry processing

Best-effort one-part attempt follows commit. Protected provider-neutral POST `/api/internal/notifications/process` supports scheduled batches of at most five parts with a 45-second between-attempt deadline. Each HTTP attempt has a 10-second timeout. PostgreSQL event row locking with SKIP LOCKED prevents simultaneous sends for one event; the lock is held over one bounded request, not a whole multipart batch. Six committed attempts, exponential delay from 60 seconds capped at one hour. Temporary transport/408/429/5xx errors retry; other 4xx become dead. No distributed lock service is needed.

This is provider acceptance tracking, not delivery/read receipts. WhatsApp may duplicate after ambiguous acceptance/crash; no exactly-once guarantee is claimed. A crash rolls back the processing transaction and current attempt count. Scheduler monitoring and manual recovery policy remain operational requirements.

## Security

Server-only env credentials, no real env file packaged. Frozen DB envelopes contain PII but no secrets. No full request/provider response/SQL dumps in routine logs; error categories are sanitized. Scheduler authentication uses timingSafeEqual on fixed-length hashes and requires a strong secret. HTTP redirect following is disabled for authenticated provider calls. The public API has no booking-read endpoint. Existing honeypot/body cap remains; deployment must add upstream limits/distributed abuse protection. PostgreSQL TLS, least-privilege roles, backups and retention are documented.

Integration tests require a dedicated *_test DB, explicit TEST_DATABASE_RESET=1 and a different database from DATABASE_URL. Unit transports are mocked. Live test script defaults off, requires LIVE_NOTIFICATION_TEST=1, refuses multiple recipients/channels/multipart sends and uses clearly synthetic data. No live test was executed.

## Tests

### PASSED

- `npm test`: **120 tests passed, 5 files** (24 existing rules + 15 schema + 38 Booking V2 + 6 API + 37 infrastructure/provider/API/security cases).
- `npm run typecheck`: exit 0 after final source/test additions.
- `npm run build`: stock Turbopack production build exit 0, compilation + TypeScript + **12/12 static pages**; no offline font hook or type-check bypass. Previous Google Fonts limitation did not recur in this run.
- `npm run db:generate`: generated committed SQL; subsequent run reported no schema changes.
- `npm ci --ignore-scripts --dry-run --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000`: passed.
- `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=20000`: exit 0, **511 packages installed**. Phase 5C needs Drizzle/pg and migration CLI dependencies; updated lockfile is intentional and the prior mismatch no longer blocks this command.
- `python3 scripts/check_i18n_parity.py`: 222 keys, identical EN/RU/TH/ZH.
- `LIVE_NOTIFICATION_TEST=0 npm run notifications:test:live`: expected exit 1 before any provider call. CLI scripts use Node’s tsx import hook; this avoids the standalone tsx CLI’s sandbox-denied IPC listener.
- Direct API tests cover required keys, same-result replay, conflict 409, safe storage failure, received despite notification failure and unauthenticated processor denial. These are route-handler/factory checks, not a live browser/DB end-to-end result.
- Baseline ZIP comparison: homepage/layout, all existing canonical business data, integrated images/logo and locale files unchanged from Phase 5B. Frontend change is limited to request idempotency and displaying the returned public reference.
- Final archive CRC and byte comparison verify packaged source, migration metadata, docs, production assets and env example; exclude node_modules/.next, real env, source uploads, QA binaries/data, logs and checkpoints.

### BLOCKED BY ENVIRONMENT / PREREQUISITE

- `npm run test:integration`: exit 1 at the explicit TEST_DATABASE_URL prerequisite; **0 integration tests executed**, not a pass/skip. The suite contains **21 real PostgreSQL cases** for persistence, normalized reconstruction, package/extra, rollback including outbox failure, concurrent idempotency, reference uniqueness, fresh-process readback, retries, max attempts, partial success and worker concurrency.
- No PostgreSQL/Docker service was available. Isolated PostgreSQL QA binaries were obtained outside project dependencies, but the environment denied changing to an unprivileged OS user (`runuser: cannot set groups: Operation not permitted`; ownership change also denied). No workaround or production database was used. Real migrations, row-lock behavior, database restart/readback and outbox recovery must be verified before release.
- Phase 5B browser preview previously returned ERR_BLOCKED_BY_CLIENT. This phase used focused API/type/build checks; it does not claim browser submission QA or a repeated visual matrix.

### FAILED — BASELINE TOOLING

- `npm run lint`: existing FlatCompat circular-serialization configuration error. ESLint configuration unchanged; no suppressions added.

### REQUIRES EXTERNAL CREDENTIALS

- LINE real token/authorized staff target and recipient confirmation.
- WhatsApp account/phone/token, current supported version, exact approved template, opted-in recipient and delivery confirmation.

## Live verification

No live provider messages, production DB writes or production migrations were performed. No delivery success was fabricated. Stock build success is separate from DB/runtime integration acceptance. A combined milestone checkpoint preserved schema/repository/tests and outbox/providers/tests before final documentation.

## Remaining external setup

Provide a dedicated PostgreSQL test database, run migrations twice and all integration tests, then validate staging API submission/restart/readback and scheduler recovery. Review/run production migration with backup and proper DB roles. Configure approved accounts/targets/templates and perform one explicitly authorized live test per provider. Schedule the protected processor and monitor dead/partial/pending work. Complete existing browser submission QA in an accessible environment before launch.

## Known limitations

Real PostgreSQL suite not executed; live providers and delivery receipts not verified/implemented. WhatsApp ambiguous retries may duplicate. Multipart messages can arrive separately; failed parts require operator attention. LINE delayed first attempts beyond conservative cutoff require review. Memory mode has no durable queue. Idempotency survives server restarts through DB but a new/remounted client form is a new intent. No automatic opt-out ingestion; queued recipient changes need operator action. Data retention/rate limits remain deployment policy. Inherited lint failure remains. Template approval is an external gate, not guaranteed by schema-correct API requests.

## Scope integrity

No CRM, admin, customer accounts/authentication, payments, inventory engine, locking of availability, automatic confirmation, chatbot, analytics redesign or invented business data. Existing hours, rider limits, package definitions/mock flags and empty real add-on catalog remain unchanged. Booking V2 and Phase 5A.1 design/assets are preserved. No next phase started.
