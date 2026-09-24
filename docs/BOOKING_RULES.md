# ODIN — Booking Rules

Current: Phase 5B. Booking means a request received, never availability reserved or automatically confirmed.

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

Zod owns shape, enums, bounded strings and array sizes. Technical limits: 50 top-level items, 50 components per package, 200 participants per activity, 50 selected options. These are payload/UI protection limits, not business capacities. The route rejects raw bodies over 256,000 characters and filled honeypots. Distributed rate limiting and request idempotency are not implemented; deploy them with durable persistence before a public launch.

## Submission and failures

Validate → persist → attempt staff notifications → return HTTP 201 `{status:'received', id}`. Persistence failure returns a generic error; notification failure after persistence is logged by reference/channel and cannot erase the request or return a booking failure. The in-memory adapter still loses data on restart. There is no inventory locking, payment, admin status transition or instant confirmation.

Duplicate-click protection exists while the browser request is in flight. A retry after an ambiguous network failure may still duplicate a persisted request: Phase 5C needs durable idempotency. Notifications are synchronous bounded transport attempts, not a durable queue; retries/outbox/receipts remain Phase 5C.
