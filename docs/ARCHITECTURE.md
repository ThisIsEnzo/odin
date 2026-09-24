# ODIN — Architecture

Current implementation: Phase 5B on the supplied Phase 5A.1 project. Earlier greenfield proposals are superseded by the actual modules described here.

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
| booking/submit.ts | Persist first; isolate subsequent notification failure |
| booking/repository.ts | Persistence contract and volatile development implementation |
| booking/notify.ts | One complete operational payload, fanout and delivery outcomes |
| booking/providers/* | Official provider transport only |

Review groups activities by date and retains package context. Each activity can be edited without clearing others. Only one top-level item's editor is open at once; package components are configured explicitly. Contact is collected once. Error summaries identify activity and rider. No guest names, invented prices, durations, add-ons or total charges are introduced.

## Notifications

`buildBookingNotificationPayload` makes a complete snapshot and operational text from the persisted request, including all components, participants/weights, options, contact, notes and received status. IDs are used instead of storing presentation labels. Staff text uses stable operational English; customer-facing UI is localized.

`FanoutNotificationService` calls configured adapters independently. Outcomes mean API accepted or failed, not confirmed end-user delivery. Routine logs contain reference/channel, not access tokens, provider responses or customer PII. Console is the local default and does not transmit messages.

LINE uses Official Account Messaging API `POST https://api.line.me/v2/bot/message/push`, bearer token and configured staff user/group ID. Long text is chunked with reference/part markers and at most five messages per call. Retry keys are generated per attempt; durable reuse of those keys and replay handling must be implemented with an outbox before adding retries.

WhatsApp uses Business Platform Cloud API `POST https://graph.facebook.com/{configured-version}/{phone-number-id}/messages`. It requires a configured approved template with three body parameters: reference, part, details. It does not assume the recipient has an open 24-hour service window. Long operational text is normalized for template parameters and divided into parts without dropping details. Template approval, exact template shape, recipient opt-in, account configuration and real delivery remain unverified. No API version or IDs are fabricated as production defaults.

Both transports use environment configuration and 10-second per-request timeouts. `.env.example` contains empty credentials. Staff transport configuration is independent of the mock public website contact data. No customer message is sent by this phase.

Official references consulted:
- https://developers.line.biz/en/reference/messaging-api/
- https://developers.line.biz/en/docs/messaging-api/retrying-api-request/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/overview
- https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages

## Phase 5C boundary

Replace in-memory storage behind BookingRepository with transactional durable storage. Add an atomic notification outbox, provider-specific delivery records, retry scheduling and reusable LINE retry keys, WhatsApp delivery webhooks, idempotent submissions, distributed abuse controls, retention/access controls and monitoring. Coordinate configuration validation and real staff-channel delivery trials. Production database deployment, CRM, admin panels, payments and inventory locking are not part of Phase 5B.

## Verification

See PHASE_5B_STATUS.md for commands actually completed and environment limitations. No lint/type suppression or build-check bypass is introduced. Dependency manifests retain the supplied baseline; use npm install locally while the pre-existing lockfile mismatch remains unresolved. Tests use mocked provider HTTP transports and do not demonstrate live messaging delivery.
