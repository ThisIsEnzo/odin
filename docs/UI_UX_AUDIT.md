# ON GROUND — Current booking audit

## V3 stacked booking redesign

Parent: brand/on-ground-khao-mai-kaeo-refresh at 9729ac0d52357b0ec3da49aa64bb046eb273e14d, Draft PR #3 open/unmerged. New branch booking/simplified-request-flow targets that parent. Brand PR scope is unchanged.

| Previous friction | V3 behavior |
| --- | --- |
| SaaS-like multi-step itinerary builder | One entry form, one Review screen, then Received |
| Repeated activity date/time | Global visit date/preferred arrival; manager coordinates timing |
| Per-rider weights | No weight fields; 90/60 kg maximum information retained |
| Subtle selection/editor complexity | Included badge, expanded controls, clear Add/Remove |
| One ATV implicitly equals one guest | Generic capacity units: 5 guests may use 3/4/5 ATVs |
| Nested mock packages | Activity-first; truthful homepage Plan a visit CTA |
| Unknown tariffs risk partial totals | Pending duration/price and all-known-or-pending total |
| Staff need operational request details | Versioned outbox text with global preference and counts |

Automated: 200 tests passing, TypeScript/build passing, 320 locale keys in parity, diff check passing. React tests cover single-page structure, add/remove/reset, capacity bounds, approved-tier behavior, preserved Edit, four locales, future fifth card, received reference, retry intent and server error routing. PostgreSQL-engine tests cover additive migration over a pre-existing V2 record and V3 round-trip/snapshot/outbox/rollback.

Browser automation is unavailable in this managed environment. Responsive CSS specifies one column below 1024px, wrapping controls, 48px steppers and 52px inputs; **visual/no-overflow/focus geometry at 375/390/430px is pending actual browser review**. jsdom does not verify pixel layout. No new screenshot, accessibility certification or performance score is claimed. Large unchanged photos are retained in the remote tree; the connector returned empty contents for files over 1 MB, so the local Git worktree omits those photos. No ZIPs were used.

Customer outbound thank-you delivery is not configured; the localized on-screen receipt is implemented. No real booking/provider send, live DB migration, merge or deployment is performed. See BOOKING_V3_STATUS.md for release requirements.

## Historical brand audit (before V3)

The following records the parent work only. Its itinerary/UI details and browser evidence do not describe the new V3 flow.

# Final corrective UX/UI audit

Baseline: existing Draft PR #3 at GitHub HEAD 6bf2421ee65f7e7518627584fbf094d4c05a4a52. All 183 blobs and the exact commit/tree were recovered. Baseline homepage/Booking were inspected in Chromium before editing, together with design/audit/status docs. Old archives supplied only photographs whose Git blob hashes matched GitHub, never source code.

| Client finding | Final implementation |
| --- | --- |
| Footer too bright/terracotta-heavy | Deep #281B16 earth, cream typography and restrained mineral texture |
| Seal/signature visually misaligned | Centered 232px column, 88px seal, 20px separation and 3px optical correction |
| Transparent wordmark lacked depth | Exact uploaded title pixels in an SVG alpha matte, original cream/bevel RGB and restrained CSS shadow |
| Horse needed production treatment | Exact logo-horse.jpg as CSS-cropped seal; extraction previews rejected for artwork drift |
| Texture interpreted as bright color | One .brand-material with independent base, procedural grain and tonal variation |
| Header/navigation utilitarian | Proportional signature, 16px nav, quieter locale selector, cream CTA and compact sticky state |
| Rider weight resembled an error | Cream/earth/secondary metadata; error token only for errors |
| Duration/price missing before adding | Shared explicit facts on homepage/discovery; confirmed offers or Manager to confirm |
| Repeated times unexplained | Start time label, per-experience start explanation and Thailand local-time help |
| Package opened multiple forms | One component editor, other components visible as itinerary rows; invalid component opens on validation |
| Mobile itinerary hidden | Disclosure open by default with activity/date/start/duration/guests/weights/price/readiness |
| Extras/retained visit unclear | Visible Add another experience; package and extra retained as separate numbered entries |
| Misleading total risk | Canonical all-known-or-pending total, no double count and final-price manager notice |
| Homepage/Booking inconsistent | Same palette, type, offer presentation, controls, spacing and material |

## Preserved and verified

Cinematic Hero/direct Experiences transition, no statistics strip; established homepage sections/photographs; approved navigation/Maps; locale fonts; generic anchors; API payload/request semantics; catalog facts/pricing/validation/DB/migrations/idempotency/providers.

The duration-selector regression test uses the localized Start time label. No assertion or behavioral coverage was removed. New tests protect pre-add facts/mock-price suppression, visible mobile itinerary/time help and one-component package editing/error routing.

BRAND_REFRESH_STATUS.md records actual checks. Browser receipt responses are intercepted locally; no real booking or provider delivery. Targeted visual/keyboard checks are not independent WCAG certification or native linguistic review.

Remaining input: approved duration/price tiers/billing basis for each experience; confirmed package contents/prices; verified contacts and optional textual address/legal content. Unknown durations prevent a fabricated visit-end time.

## Focused final brand polish — client feedback

Continued from remote e01a0b931c452b1e6d10138c9d7fc26f4aaf4b69, all 188 blobs verified. No old archive source baseline; only identical photograph blobs recovered by hash. Booking, translations, canonical business facts and backend are unchanged in this pass.

| Latest client finding | Resolution |
| --- | --- |
| Location is text-only | Lazy live Google listing embed, identifier verified from the client short link, editorial split and independent exact Google Maps CTA |
| Footer wordmark appears rectangular | Full RGBA WebP/PNG; decoded alpha verified, zero-alpha borders/counters; no runtime SVG filter or terracotta matte |
| Header cutout looks soft/low quality | Fresh original-resolution export, stable raster antialiasing and narrow retained source bevel; intrinsic 1270px for 188–250px display |
| Material is too flat/unfaithful | Two procedural mineral scales with diffuse relief lighting and soft-light blend, tuned at normal and 3× browser scale |

Existing seal remains an intentional circular crop of the original horse relief. Footer 232px lockup, 88px seal, 20px separation and 3px optical correction remain; Header grid/heights/navigation are preserved. Both wordmarks use the same production export and restrained shadows.

Only official logo derivatives, shared material, Location panel and these documents change. Final current-pass test/browser results are recorded in BRAND_REFRESH_STATUS.md.
