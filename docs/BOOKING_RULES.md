# ODIN — Booking Rules

Current: Phase 5C. Booking means a request received, never availability reserved or automatically confirmed.

## Confirmed facts

| Service | Opening inclusive | Closing exclusive for activity starts | Maximum weight |
| --- | --- | --- | --- |
| Horse Riding | 07:00 | 18:00 | 90 kg per rider |
| Pony Riding | 07:00 | 18:00 | 60 kg per rider |
| ATV | 07:00 | 20:00 | Not requested |
| Sauna | 08:00 | 21:00 | Not requested |
| Restaurant | 07:00 | 23:00 | Not applicable |

These remain unchanged in canonical data. No age validation is introduced; existing age values remain mock informational data. Prices and package contents also remain mock.

## One rules layer

`booking/rules.ts` owns V2 `validateVisit`, restriction checks, slot generation, calendar/date policy, package composition, option applicability and contact-channel availability. It returns paths such as `items.0.components.1.participants.1.weightKg`, keys and interpolation metadata. React displays translated errors; Zod delegates business checks through superRefine; the API validates again. No hours or weight thresholds live in UI or providers.

The legacy `validateBookingRequest` helper remains for existing primitive tests/consumers; the active API exclusively accepts the V2 schema. V1's shared-weight helper is not a migration path.

- A visit needs at least one item, and each activity at least one participant.
- Every riding participant needs a finite positive weight; maxima are inclusive and data-driven through `requiresWeight` and `restrictions`.
- ATV/Sauna do not collect or accept irrelevant weights.
- Calendar dates must be real, today or later in Asia/Bangkok, up to the existing 90-day engineering window. This window is not a newly confirmed business fact.
- Slots derive from opening time and the configured interval. Closing itself is excluded. The interval is not an activity duration or proof of availability.
- Package components must match the canonical catalog exactly; standalone extras remain allowed.
- Item/component/participant IDs are unique within the request.
- Options must exist, apply to the target, be unique on that target and satisfy configured integer quantities.
- Customer name, email and phone are required once. Notes are optional, max 500 characters.
- Preferred channels require non-mock configured contact data; LINE/WhatsApp require explicit customer identity.

## Structural and abuse boundaries

Zod owns shape, enums, bounded strings and array sizes. Technical limits: 50 top-level items, 50 components per package, 200 participants per activity, 50 selected options. These are payload/UI protection limits, not business capacities. The route rejects raw bodies over 256,000 characters and filled honeypots. Server idempotency is now implemented. Distributed rate limiting and an upstream request-size cap remain deployment requirements.

## Submission and failures

Validate V2 + UUID Idempotency-Key → atomically persist booking/children/canonical outbox/delivery plans → attempt one part → return HTTP 201 `{status:'received', id, reference}`.

A unique idempotency key and canonical request hash protect same-intent retries: same key/content returns the original result, incompatible reuse returns 409. The client retains the key for unchanged content after a network failure; edits create a new key. Separate form sessions/remounts are separate intents. IDs, reference and status are generated server-side, never accepted from client status fields.

Persistence or required configuration failure returns safe 503; it must not report received. Any transaction failure rolls back the entire aggregate/outbox. Notification failure after commit cannot erase the request or change API acceptance. Failed parts remain retryable or dead for operator review, while successful channel parts remain sent.

No business hours, weight thresholds, status semantics, prices, packages or options changed. No inventory locking, payment, customer account or instant confirmation. See ARCHITECTURE.md and PRODUCTION_BACKEND_SETUP.md for retry, concurrency and production configuration details.
