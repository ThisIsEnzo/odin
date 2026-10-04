# ODIN — Data Model

Current: Phase 5C infrastructure, canonical Booking V2. Canonical TypeScript definitions: `src/types/domain.ts`.

## Facts and content

`src/data/odin` holds canonical IDs, operating hours, restrictions, mock flags and pricing facts. Names and UI copy remain in four locale files and are resolved by `translationNamespace`. Existing business data and Phase 5A.1 assets have not been changed.

## Booking V1 → V2

V1 stored one experience, one date/time and a shared guest count/weight. V2 stores a versioned visit:

```ts
BookingDraft {
  schemaVersion: 2;
  customer: BookingCustomer;
  items: BookingItem[];
  notes?: string;
  locale: Locale;
}
BookingRequest extends BookingDraft {
  id: string;
  reference?: string; // populated on every new persisted request
  status: 'received' | 'confirmed' | 'declined' | 'cancelled';
  createdAt: string;
}
```

A request starts only as `received`. ID, status and creation timestamp are server-owned. Customer information is collected once: name, email, phone. Notes moved from customer to request. Optional `preferredChannel` and explicit `channelIdentity` support future verified contact channels. All current contact data is mock, so no preferred-channel selector is exposed. LINE/WhatsApp identity is never inferred from phone.

V1 POST payloads are deliberately rejected: a shared riding weight cannot safely be converted into multiple riders. Existing homepage query links still initialize the new flow. There is no durable V1 database to migrate; any externally retained V1 records need an explicit migration, especially per-rider weights.

## Items and participants

`BookingItem = ActivityBookingItem | PackageBookingItem` is a discriminated union.

An activity has stable `id`, `type: 'activity'`, canonical `experienceId`, its own `date` (`YYYY-MM-DD`), `time` (`HH:mm`, Asia/Bangkok), `participants[]` and `options[]`.

Each participant has a stable ID and optional weight. Names are not collected. Participant count is derived from `participants.length`, preventing contradictory count/array data. Participants are local to each activity: no assumption that Guest 1 in two activities is the same person. Edits retain IDs; duplicates receive fresh item, component and participant IDs. Removing an item cannot modify another.

`Experience.durationMinutes?` is a future confirmed-duration field. No actual durations are populated and slot intervals are not interpreted as durations. Conflict detection is deferred until duration and cross-activity participant identity are defined; simultaneous activities for different people may be valid.

## Packages

A package item has stable `id`, `type: 'package'`, canonical `packageId`, explicit `components: ActivityBookingItem[]`, and `options[]`. Server rules require exactly the configured experience multiset. Every component has independent scheduling/participants. Additional standalone items are siblings in the same request.

Current canonical MOCK packages:

| Package | Activity components | Other inclusion |
| --- | --- | --- |
| family-day | pony-riding | Restaurant |
| adventure-day | atv | Restaurant |
| couple-escape | horse-riding, sauna | Restaurant |

`includesRestaurant` is derived from the package catalog and carried into review/notification text. Restaurant arrangements remain staff-coordinated; no invented start time, duration, table capacity or meal option is stored. Marketing text does not create additional bookable components. Existing mock prices are not used to calculate invented totals.

## Options

`BookingOption` defines ID, translation namespace, type, applicable experience/package IDs, quantity constraints and optional pricing metadata. Selections store only `optionId` and `quantity`. `src/data/odin/booking-options.ts` is intentionally empty. Both UI and validation use this catalog, so unknown or inapplicable selections fail. Quantity controls appear only when real definitions are added. Scheduling an extra activity uses an activity item rather than an opaque option. Changing participant count uses the participant array.

## PostgreSQL persistence

`BookingRepository.create(BookingDraft, {idempotencyKey})` retains the original boundary while adding submission metadata outside the business draft. PostgreSQL requires a valid key; in-memory tests may omit it. Both adapters generate a public reference and initial received status. Optional reference typing permits old Phase 5B fixtures; new DB rows require it.

| Table | Purpose |
| --- | --- |
| bookings | Internal UUID, unique public reference, received/status, V2 version, locale, one customer/contact, notes, timestamps, unique idempotency key and canonical request hash |
| booking_items | Internal row UUID + stable domain ID, booking FK, same-booking parent FK, explicit type/activity/package IDs, date/time, position |
| booking_participants | Item FK, stable participant ID, position, optional weight; no names |
| booking_item_options | Item FK, stable option ID, position, quantity; no invented catalog data |
| notification_outbox | One booking.received event per booking, immutable canonical payload snapshot, aggregate status and completion timestamp |
| notification_deliveries | Event FK, provider/recipient/part, frozen credential-free envelope, retry UUID, status, attempts, next attempt, sanitized error, acceptance ID/time |

Root and component positions are persisted separately with unique indexes. Duplicate frontend IDs in different bookings do not conflict. Participant counts remain derived, and decimals are preserved as PostgreSQL float8 for JavaScript-number round trips. Activity dates/times remain canonical local strings for Asia/Bangkok scheduling, not silently converted UTC instants. Creation/update/processing timestamps are timestamptz.

Operational booking data is normalized; immutable notification snapshots/envelopes and the historical estimate snapshot use JSONB. This is intentional: retries must not reinterpret historical requests against a changed business catalog, template or destination. Stored snapshots/envelopes contain PII and require the same retention/access protection as bookings. No credentials are stored in them.

The whole request, event and delivery plans commit atomically. Separate recipient/part state preserves partial success. PostgresBookingRepository reconstructs the existing aggregate without introducing a second incompatible domain model. SQL shape/FK/uniqueness constraints supplement API validation; semantic catalog/rider rules remain in the shared application layer. Memory mode remains explicitly non-production and volatile.

## Duration and estimate snapshot extension

The additive `0001_superb_wiccan.sql` migration preserves `0000` and adds:

- `booking_items.duration_minutes INTEGER NULL`, constrained to positive values on activity rows only. Null supports legacy rows and requests whose duration still needs agreement.
- `bookings.estimate JSONB NULL`, typed as `BookingEstimate`. Null is reserved for legacy rows without a snapshot; new requests store a version-1 snapshot even when its amount is pending.

`ActivityBookingItem.durationMinutes` is numeric and optional only while no approved tiers exist. Package component duration uses the same activity structure. Approved catalog tiers carry minutes, THB amount/unit and an explicit billing basis. No production tiers are populated yet.

The server-generated snapshot stores currency, overall amount (number or null), and top-level estimate lines with item ID, amount, selected duration where applicable, unit amount, unit and quantity when known. Package components remain normalized rows and contribute no standalone charge. This is the least additional storage needed to preserve the quoted tier and total without recomputing old requests against a changed catalog.

The snapshot is written with the booking, duration rows and outbox in the existing transaction. Outbox payloads include that same snapshot; notification text records duration or pending, each priced tier and overall estimate/pending plus manager-confirmation semantics. Provider envelopes, retry processing and transaction boundaries are unchanged. Reads and same-key idempotent replays return the stored estimate, even after catalog prices change. The request fingerprint uses the submitted selection, not a newly calculated price. Client price/estimate input is stripped at the API boundary.

Both migrations and repository round trips are exercised by an isolated PGlite PostgreSQL engine test, including catalog change, historical snapshot, duration, outbox equality and invalid stored duration. This does not claim deployment to the production database or replace live PostgreSQL concurrency/provider verification.
