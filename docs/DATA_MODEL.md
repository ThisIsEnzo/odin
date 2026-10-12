# ON GROUND — Versioned booking data

Canonical facts live in `src/data/odin`; localized display copy lives in EN/RU/TH/ZH messages. The public model is V3, with historical V2 preserved explicitly.

## Public V3

```ts
BookingRequestDraft {
  schemaVersion: 3;
  visitDate: string;             // YYYY-MM-DD, Thailand local date
  preferredStartTime: string;   // HH:mm preference, not individual activity timing
  customer: { fullName: string; email: string; phone: string };
  activities: Array<{
    activityId: string;
    guestCount: number;
    durationMinutes?: number;   // optional only while canonical tiers are absent
    unitCount?: number;         // capacity_unit activities only
  }>;
  notes?: string;
  locale: 'en' | 'ru' | 'th' | 'zh';
}
```

`BookingRequestV3` adds server-owned UUID, public reference, status, creation timestamp and immutable `BookingEstimate`. `SupportedBookingDraft` and `StoredBookingRequest` are explicit version unions. Repositories overload `create` for correctly typed V2/V3 callers; reads require checking `schemaVersion` before interpreting the shape. V2's `BookingDraft`/`BookingRequest` remain unchanged for existing records and tooling. Public POST accepts V3 only, with no destructive conversion or implicit V2 reinterpretation.

The customer name is stored in existing `bookings.customer_name` and mapped to V3 `fullName` or historical V2 `name` on read. Existing public reference format remains unchanged for compatibility; the UI presents it as a reference, not a confirmed reservation.

## Canonical booking behavior

An experience opts in through `booking` metadata:

- `per_person` or `group`: guest count, activity-specific duration.
- `capacity_unit`: guest count, `unitCount`, `maxGuestsPerUnit` and a localized unit label key.
- `bookingImage`: existing local photography, with a generic existing placeholder fallback for future content.

The behavior type does not specify a billing basis. Sauna group requests do not assert an unconfirmed group tariff. `DurationOption.quantityBasis` explicitly supplies participant, booking or unit billing when an approved duration-price tier is provided. Current tier arrays remain empty. Restrictions including 90/60 kg rider maxima remain canonical information. Public V3 has no participants or weights.

## Additive database migration

`0000_massive_gabe_jones.sql` and `0001_superb_wiccan.sql` remain untouched. New `0002_deep_wonder_man.sql` adds:

| Storage | V3 change |
| --- | --- |
| bookings | Nullable visit_date and preferred_start_time; version check accepts 2/3; V3 requires both fields |
| booking_request_activities | Booking FK, canonical activity ID, ordered position, guest_count, nullable duration_minutes and unit_count |
| bookings.estimate | Existing JSONB estimate snapshot reused |
| notification_outbox | Existing frozen payload now supports explicit V2/V3 union |
| notification_deliveries | Existing frozen provider envelopes/retries unchanged |

Activity/position uniqueness and positive count/duration constraints supplement application validation. Unit count cannot exceed guests in SQL; capacity minima depend on current canonical metadata and are checked server-side. Canonical activity IDs are validated against the catalog, not an inflexible DB enum.

New V3 requests create no booking_items, booking_participants or booking_item_options rows. Historical V2 tables/FKs/weights/options/package components and individual dates/times remain intact. Separate V3 count rows avoid changing historical `item_shape` semantics or creating synthetic guest records. All rows, estimate, outbox and plans commit or roll back together.

Idempotency fingerprints include version and validated request fields, not a newly calculated price. Unique keys protect concurrent same-intent submissions. Replay reads the stored version-specific aggregate and original estimate. Reading V3 requires visit fields and an estimate snapshot; invalid/future stored versions fail explicitly.

## Historical verification

The in-process PostgreSQL-engine tests apply the old two migrations, insert an actual V2 record with an individual activity time, duration and 75.5 kg rider, then apply V3's additive migration. The repository returns its unchanged V2 shape. V3 tests verify count rows, absence of participant rows, global timing, immutable price after catalog changes, same-key replay/conflict, outbox equality and atomic rollback. This is not a claim that production migrations or live PostgreSQL concurrency tests were run.

A dedicated real PostgreSQL suite also contains V3 round-trip, concurrent same-key and new-connection cases. It remains fail-closed unless a separate `*_test` database is configured. No production DB or external provider is used by unit tests.
