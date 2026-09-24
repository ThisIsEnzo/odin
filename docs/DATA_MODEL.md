# ODIN — Data Model

Current: Phase 5B, Booking V2. Canonical TypeScript definitions: `src/types/domain.ts`.

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

## Persistence boundary

`BookingRepository.create(BookingDraft)` and `getById` transport the whole versioned aggregate. The development adapter copies inputs and outputs to prevent caller mutation. No UI/API consumer depends on its Map implementation. In-memory data is volatile and instance-local; durable transactional storage is Phase 5C.
