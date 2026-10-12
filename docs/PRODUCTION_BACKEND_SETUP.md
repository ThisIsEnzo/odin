# Production backend setup — Phase 5C

## Prerequisites and configuration

Node >=20.9, npm, PostgreSQL 16+ with a dedicated ODIN database. No Neon/Supabase SDK is required: use an ordinary PostgreSQL URL. Use verified TLS for hosted databases (provider CA/sslmode requirements); do not disable certificate verification. This implementation has NOT yet passed live PostgreSQL verification in the supplied sandbox.

```sh
npm ci
cp .env.example .env.local
```

Set real values privately in `.env.local` for Next.js or the hosting environment. CLI commands below read exported environment variables; they do not automatically load `.env.local`. Do not paste secrets into shell history. A trusted local env file can be loaded using your shell's environment loader. Node 20.9 users should prefer exported variables rather than newer Node `--env-file` variants.

Required production values:

| Variable | Meaning |
| --- | --- |
| NEXT_PUBLIC_SITE_URL | Public HTTPS origin; never a secret |
| BOOKING_STORAGE | `postgres`; production rejects `memory` |
| DATABASE_URL | PostgreSQL connection string |
| BOOKING_NOTIFICATION_CHANNELS | Explicit `line`, `whatsapp`, or both; production rejects console |
| NOTIFICATION_PROCESS_SECRET | At least 32 random characters, server-only |
| Channel variables | See NOTIFICATION_SETUP.md |

Generate a scheduler secret locally: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Store it in your secret manager, not source control. `npm run backend:check` validates production settings without connecting or disclosing credentials. Run it as a release/startup gate. API initialization is lazy so builds need no database credentials; missing runtime settings fail safely with HTTP 503 and a configuration-category server log, never memory fallback.

## Local PostgreSQL

The compose file exposes PostgreSQL only on loopback. Set a local `POSTGRES_PASSWORD` in your environment, then:

```sh
docker compose up -d postgres
# Set DATABASE_URL for database odin with that password before these commands.
npm run db:migrate
npm run db:status
```

The named volume is durable. Do not run `docker compose down -v` on a database you need to keep. Use a separate `odin_test` database and restricted test credentials for tests. The bundled compose setup is local development infrastructure, not a production deployment specification.

Frontend-only development can explicitly use `BOOKING_STORAGE=memory` and `BOOKING_NOTIFICATION_CHANNELS=console` with `npm run dev`. It is volatile, has no durable outbox, and cannot be enabled in production. Unit tests inject their own memory repository and never need Docker.

## Migrations and release

Source schema: `src/lib/db/schema.ts`. Committed SQL and Drizzle metadata: `drizzle/`.

Booking V3 requires the new additive `0002_deep_wonder_man.sql` before deploying this branch. It adds global visit fields, permits schemaVersion 3 and creates count-based activity rows. Existing V2 tables/weights and applied migrations are preserved. The current public API accepts V3 only; deploy the frontend/API together after the migration. No production migration has been applied by this PR. Customer outbound message delivery remains unconfigured; staff channels and browser receipt are the implemented behavior.

```sh
npm run db:generate  # development: generate reviewed SQL after schema changes
npm run db:migrate  # apply committed migrations; safe to rerun
npm run db:status   # compare committed migration hashes with applied hashes
```

Never use schema push/auto-sync in production. Generation does not need DATABASE_URL. Migration execution takes a PostgreSQL advisory lock on a dedicated connection so two release jobs cannot apply the same migration concurrently. Use a direct/session database connection for migrations, not a transaction-pooling proxy that cannot retain session advisory locks. Do not edit already-applied SQL; add a migration.

Release sequence: back up → apply to staging/test → run integration tests → inspect SQL/locks → run one production migration job with a migration role → validate application configuration → deploy application → verify booking/outbox readback and scheduler. Application role should have only required table CRUD permissions; migration role owns DDL. There is no automated destructive rollback command. Use a reviewed forward fix or documented backup restoration if a migration fails.

```sh
npm run backend:check
npm run build
npm run start
```

Application pool: max 5 connections per instance, 5-second connection timeout, 15-second statement timeout, 20-second idle-in-transaction timeout. Size total connections for instance count and provider limits. Workers intentionally hold a row-lock transaction across one HTTP call (10-second abort timeout). The DB idle timeout must stay above the HTTP timeout. Hosting must allow at least a minute for a scheduler invocation. Do not deploy this processor to Edge runtime or a platform that suspends work mid-request without rescheduling it.

## Dedicated database tests

Integration tests are destructive only inside the deliberately configured test database. They refuse to run unless its name ends in `_test`, `TEST_DATABASE_RESET=1`, and it differs from DATABASE_URL by host/database name. Never point them at production. The guard cannot detect two differently named DNS aliases for the same cluster: use a genuinely separate DB/role.

```sh
# Export TEST_DATABASE_URL for your dedicated odin_test database.
export TEST_DATABASE_RESET=1
npm run test:integration
npm test
npm run typecheck
```

The suite applies migrations twice, truncates test bookings before each case, tests normalized reconstruction/rollback/idempotency and outbox concurrency, and reads a booking in a fresh Node process. Providers are injected mocks: no live sends. A missing test URL is a failing prerequisite, not a silently skipped pass. Unit tests (`npm test`) remain independent of DB infrastructure.

## Scheduler / retry processing

Schedule an HTTPS **POST** every minute to `/api/internal/notifications/process` with `Authorization: Bearer <NOTIFICATION_PROCESS_SECRET>`. Keep the secret in your scheduler's credential store. Do not put it in the URL. An example using environment variables:

```sh
curl --fail --silent --show-error --request POST \
  --header "Authorization: Bearer $NOTIFICATION_PROCESS_SECRET" \
  "$ODIN_INTERNAL_BASE_URL/api/internal/notifications/process"
```

The endpoint does not accept a caller-selected batch size. It processes at most five delivery parts, with a 45-second loop deadline checked between attempts (a current attempt can add up to 10 seconds). Run a compatible external scheduler or server task; no hosting provider or Vercel Cron configuration is assumed. The scheduler must retry non-2xx invocations. Repeat/concurrent invocations are safe against simple worker races through PostgreSQL `FOR UPDATE SKIP LOCKED` on the event. One immediate part is attempted after a booking commits; the scheduler is REQUIRED to finish multipart/multichannel work and failures.

Per-part retries: 6 attempts; 60s exponential backoff capped at 1h; HTTP 408/429/5xx and transport failures retry, other HTTP 4xx become dead. Sent parts are not retried. LINE parts older than 23h from event creation stop for manual review, conservatively inside its retry-key window. The payload, destination, template settings and retry key are frozen in the transaction; rotate access tokens without rewriting envelopes.

## Operations and delivery semantics

`sent` means provider API accepted, not read/phone-delivered. There are no provider delivery-receipt webhooks in this phase. WhatsApp is at-least-once across ambiguous network results or crashes; duplicates remain possible. LINE keys prevent supported duplicate API acceptance only within its documented window. Crashes roll back the processing transaction; a lock is released and work remains pending. A crash before commit may also roll back an attempt increment; the counter bounds committed failures, not arbitrary process kills.

Monitor pending age/count, dead/partial events and DB errors. Example read-only operational query:

```sql
SELECT provider, status, count(*), min(next_attempt_at)
FROM notification_deliveries GROUP BY provider, status;
SELECT status, count(*), min(created_at)
FROM notification_outbox GROUP BY status;
```

Inspect `last_error` (sanitized category/status), attempts and provider_message_id with restricted database access. There is intentionally no public booking-read or retry-admin endpoint. Before manual requeue, resolve credentials/template/recipient errors, assess ambiguous sends and LINE retry-window expiry, and approve an operator recovery procedure; do not blindly reset every sent/dead row. Removing a recipient from env affects NEW bookings only: pause/cancel their pending work in the DB under operator control after opt-out. Do not repurpose a phone-number ID/token for another account while old envelopes are queued.

Backups: managed daily backups plus point-in-time recovery where available; test restores. Define retention/deletion/access policy for bookings, snapshots, recipient IDs and delivery envelopes: these contain customer data even though logs do not. Restrict DB access, encrypt storage and transport. Configure an upstream request-size cap and distributed rate limiting before public launch; the API's existing body-size/honeypot checks are not a substitute. No CRM, payments or inventory reservation is included.
