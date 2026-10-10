# ON GROUND — Booking request rules

The public flow is Booking V3: one form → Review → Send booking request → Request received. A request never reserves availability or confirms a booking/payment.

## Visit and contact

One `visitDate` and one `preferredStartTime` apply to the complete visit. Times are Thailand local time. The manager confirms the actual sequence and activity start times. The preference must be valid `HH:mm`; it is not a slot, and no activity interval, duration-end or summed-duration closing check applies. There is no confirmed global arrival-hours policy to invent. Canonical activity operating hours remain intact for staff/historical interpretation.

Date validation checks a real calendar date, today or later in Asia/Bangkok, the existing 90-day engineering window, canonical closed weekdays and blackout dates. The window is an engineering limit, not a newly confirmed business fact. Full name, valid email and phone are required once. Public V3 has no channel/provider configuration, per-activity notes or individual guest identities. One optional request note is limited to 500 characters.

## Catalog-driven activities

`Experience.booking` determines bookability and generic behavior. `bookableExperiences()` drives the cards and the server verifies selections against the same canonical catalog. Restaurant is outside this catalog. `ExperienceId` is a string with runtime catalog membership checks; a future fifth activity needs metadata and localized content, not a `BookingFlow.tsx` edit.

| Activity | Behavior | Capacity | Canonical information |
| --- | --- | --- | --- |
| Horse Riding | per_person | Guest count | Maximum rider weight 90 kg |
| Pony Riding | per_person | Guest count | Maximum rider weight 60 kg |
| ATV | capacity_unit | Guest count + unit count; max 2 guests/unit | Vehicle allocation confirmed by staff |
| Sauna | group | Guest count | Duration/price pending |

Behavior determines controls, **not a pricing basis**. Sauna's group selection records the requested group size; it asserts no per-group/per-person rate. Prices remain dependent on approved tier metadata only. Existing mock age limits are not promoted into public validation.

V3 has no weight field or weight-required validation. `restrictions.maxWeightKg` remains canonical, visible as premium information and included in staff notifications. `requiresWeight` remains only for historical V1/V2 interpretation; retired wizard components have been removed.

Each selected activity appears once with `guestCount >= 1`. For `capacity_unit`, `unitBounds()` enforces `ceil(guestCount/maxGuestsPerUnit) <= unitCount <= guestCount` on both client and server. Five guests may select 3, 4 or 5 ATVs. Guest edits preserve a chosen unit count whenever still valid, otherwise clamp it to valid bounds. Non-unit activities reject a supplied unit count. No seating allocation is collected. Technical limits: 200 guests/units and 50 selected activities, not asserted inventory capacity.

## Duration and pricing

All four live `durationOptions` arrays remain empty. V3 therefore permits omission and displays Manager to confirm. Arbitrary supplied minutes are rejected. When canonical approved tiers are supplied, duration becomes required and must match an exact positive integer tier. No slot interval or legacy mock amount supplies a duration or price.

Approved `DurationOption.quantityBasis` is explicit:

| Basis | Estimate quantity |
| --- | --- |
| participant | guestCount |
| unit | unitCount, only for capacity_unit |
| booking | 1 |

`unit` supports per-vehicle ATV pricing and future units; `participant` supports per-person pricing. Never derive one basis from `price.unit` or mock data. Monetary arithmetic uses rounded minor units. Unknown tiers, amounts, currency or quantity basis leave a pending line. The total is numeric only if every selected line is known; otherwise it is Manager to confirm, never a partial grand total. All numeric prices are estimates, accompanied by the manager's final-price disclaimer.

The server validates the public V3 schema, strips unknown client prices/estimates/participant data and computes its own estimate. Repositories freeze the estimate in the existing transaction. Replay/readback never reprices an accepted request against changed catalog data.

## Packages and historical compatibility

Current package contents/prices are mock. Public V3 is activity-first with no nested package editor. Homepage package CTAs now say Plan a visit and lead to an empty activity form. Existing valid `?package=` links show an explanatory note, without selecting or fabricating components/prices. The visitor can mention package interest in the single notes field. Confirmed package rules are a separate future product decision.

V2 draft, item/component/participant types, schema, rules, estimates and repository reads remain for historical compatibility. Old per-activity timing/weight semantics are not silently changed. The active `/api/booking` accepts V3 only; V2/V1 public submissions are rejected. No automatic conversion of historical records is performed.

## Submission and notifications

Review validates all visit/contact/catalog/capacity/duration inputs. Edit returns to the one form with everything preserved. Send requires a UUID Idempotency-Key. Same validated content/key returns the original reference; incompatible reuse is 409. The client keeps the key after a failed unchanged send and changes it after edits. A local submitting guard prevents double clicks.

The existing transaction stores request, activity counts, estimate, canonical outbox and frozen delivery plans. Persistence/configuration failure remains safe 503, never receipt. Notification failure after commit cannot erase acceptance. Staff text includes global date/preferred arrival, contact, each activity's guests/duration/units, weight restriction information, notes and estimate/pending total. LINE/WhatsApp transports, retries, locks, credentials and idempotency behavior are unchanged.

Only staff outbound channels are configured. Customer outbound message delivery is not yet configured. The localized browser receipt thanks the visitor and explains that the manager will confirm availability, timing and final price; it displays the API reference. No email/SMS/customer WhatsApp delivery is claimed.
