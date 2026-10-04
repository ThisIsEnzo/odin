# Phase 5 — final UX, duration foundation and release review

## Current status

Pricing architecture is implemented and verified; **business duration tiers remain pending client confirmation**. All four live activity tier arrays are empty. The public site shows duration/price pending and never invents numeric tiers or totals. Draft PR #2, `phase-5 → main`, is the delivery; nothing is merged or deployed.

The premium UX baseline was `f415cc1cbd3fd4a30e38ccd4d2923743dab054df`. This continuation recovered and preserved all 34 interrupted files in checkpoint **`be4d12bb2cdf910ebb2ec34c92fc997f1e078c29`**, pushed before additional implementation. Existing Phase 5 history, branding, Restaurant composition, repeated-anchor fix and Your Visit UX remain intact. GitHub and local tree hashes are checked when publishing through the connected GitHub API; CLI authentication is unavailable in this workspace.

## Delivered

- Canonical `durationOptions`: integer minutes, THB amount/unit and explicit quantity basis. No association between slot interval and duration.
- Shared client/server exact-tier validation; arbitrary numeric durations fail when no approved tiers exist. Client-supplied prices/estimates are stripped. Requests without duration remain possible while tiers are absent.
- Duration-aware slot generation: opening-inclusive, closing-exclusive start times on the original interval grid; selected duration must finish at or before closing. Changing duration clears an incompatible start.
- Central deterministic activity/visit estimation. An unknown line produces pending total, never a misleading partial total. Guests multiply only explicitly participant-priced tiers.
- Confirmed packages require explicit package/participant billing basis. Components are included once, never added as standalone charges. Package plus extra sums the two top-level lines when prices are known. Current mock packages remain pending.
- Editorial duration controls when tiers exist, honest pending duration area otherwise; subtotals, desktop summary, collapsed mobile summary and Review total, with localized final-price-manager notice.
- Server-owned historical estimate snapshot and numeric duration persistence, plus duration/tier/estimate information in canonical staff notification payloads.
- Shared navigation: **Experiences → Packages → Restaurant → Gallery → Location**.
- Mock phone/email/LINE/WhatsApp/address and mock-address Maps link are not rendered. Numeric mock activity/package prices are hidden. Package contents remain explicitly illustrative.
- Unavailable About/Contact/Privacy/Terms links removed without invented pages/legal text. Restaurant CTA now means “Plan your visit”. Nonexistent-page, farm-to-table and wood-fired-sauna claims removed/softened in every locale. Skip link localized.

## Database and notification scope

New additive migration `drizzle/0001_superb_wiccan.sql` adds nullable `booking_items.duration_minutes` with a positive activity-only constraint and nullable `bookings.estimate` JSONB. Original migration is unchanged. Legacy nulls remain readable. New snapshots include version, currency, item amounts, chosen duration, unit amount/unit/quantity where known, and total/pending.

Booking, duration rows, snapshot and notification outbox commit atomically using the existing transaction. Readback and idempotent replay preserve the saved snapshot after later catalog price changes. Provider transports, retry processor, notification delivery state machine and idempotency rules are unchanged. No live database migration or provider send was performed.

## Final verification

| Check | Result |
| --- | --- |
| `npm test` | **153 passed, 9 files**; original 128 retained plus 25 pricing/UI/persistence tests |
| `npm run typecheck` | **Passed** |
| `npm run build` | **Passed**; production compilation, typecheck and prerendering |
| `python scripts/check_i18n_parity.py` | **271 matching keys**, EN/RU/TH/ZH |
| `git diff --check` | **Passed** |
| `npm run lint` | Known inherited ESLint FlatCompat circular-serialization failure; not claimed passing |

The first recovered build encountered a corrupted persisted Turbopack cache (`.sst` truncated block). Moving generated output aside and rebuilding cleanly resolved it; no source workaround or ignored type errors was introduced.

The new persistence tests execute both SQL migrations and the actual repository through an isolated PGlite PostgreSQL engine. They check duration readback, snapshot/outbox equality, unchanged historical estimates and same-key replay after catalog changes, new-catalog pricing for new requests, pending notification semantics and the DB positive-duration constraint. This is not a claim that live PostgreSQL concurrency/deployment checks ran.

## Browser and visual QA

Production Next.js server, Chromium: **86 checkpoints, zero page JavaScript errors and no document horizontal overflow**. EN Booking widths 375, 390, 430, 768, 1024, 1280, 1440 cover discovery, single/two/three activities, riding weights, add-another, edit, duplicate, remove, package, package plus extra, customer details, Review and mocked request receipt. Four-locale mobile discovery/editor/homepage, desktop/mobile/Footer navigation order, missing-price states, localized skip link and absent mock/dead links were checked. Review and package/editor screenshots were visually inspected.

Numeric tier changes, price updates and latest valid starts are tested with clearly synthetic fixtures inside tests only. No temporary production tiers were introduced for screenshots. Browser receipt uses an intercepted response, not a real submission. A homepage `networkidle` wait timed out after the booking matrix; the harness was changed to DOM readiness and rerun successfully.

Previously completed homepage QA across EN/RU/TH/ZH at 375–1920px, keyboard menu/gallery/FAQ, focus, reduced-motion and repeated anchors remains documented in the existing Phase 5 work. This targeted continuation preserves those components rather than repeating a homepage redesign.

## Remaining client / deployment inputs

1. Approved duration-minute/THB price pairs and explicit billing basis for **Horse Riding, Pony Riding, ATV and Sauna**. No numeric tiers can be launched before these arrive.
2. Confirmed package contents, price and billing basis; any component-duration restrictions or supplements need explicit business decisions before publishing tiers. No supplements are inferred.
3. Verified address, map destination, phone, email, LINE and WhatsApp; approved About/Contact/legal content before exposing those routes.
4. Apply the new migration to staging/production through the established workflow; complete live PostgreSQL, concurrency/restart/outbox and provider verification. LINE targets/credentials and WhatsApp credentials/template/opt-in remain external setup.
5. Resolve the inherited lint configuration failure separately.

The authoritative deliverable is the updated branch and existing **Draft PR #2**. No ZIP, merge or production deployment.
