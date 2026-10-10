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
