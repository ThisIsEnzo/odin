# Final Phase 5 UX/UI audit

Baseline: GitHub `phase-5`, `bf87493a263313e9b40773f52196dc41a310898b`.
The rendered baseline was inspected in Chromium before edits, including the complete homepage, mobile Booking, Russian tablet navigation and detailed Restaurant/Gallery views. Existing Phase 5 reports were checked against the current source; historical pass claims are not treated as current evidence.

| Finding | Priority | Resolution |
| --- | --- | --- |
| Booking selection did not clearly distinguish highlighted choices from added items; full visit and additional activities were hard to understand | High | Photographic discovery with explicit add/added/edit states, one active editor, numbered itinerary, persistent desktop summary and mobile disclosure |
| Packages and extra activities lacked a clear shared context | High | Package component summaries and independent extra-activity entries within one visit, preserving the actual package definitions |
| Review felt like a generic form summary | Medium | Editorial itinerary with concise date/time/guest groups, quiet edit actions and request-received presentation |
| Activity and customer fields used different heights, backgrounds, radii and error treatments | High | Shared `.form-control`: 48px minimum, 16px text, 2px corners, solid border, terracotta focus and red error state |
| Customer details repeated the same visible heading twice | Medium | Existing inner heading visually hidden; flow heading and form labels retained |
| Header language selector hidden at 1024–1279px while mobile menu was also unavailable | High | Desktop navigation now starts at 1280px; menu retains language access below that width |
| Header/Footer logo padding shifted artwork off the shared content rail | Medium | Remove redundant inner horizontal padding while preserving asset proportions and surrounding spacing |
| Terracotta Restaurant CTA had weak separation from the green panel; focus rings varied across dark surfaces | High | Shared inverse cream CTA and cream focus context on Hero, Experience photography, Restaurant and final CTA |
| Menu controls, language control and some lightbox/hero controls were smaller than the intended touch target | Medium | Minimum 44px controls; FAQ summary minimum 44px; mobile footer links 44px with compact two-column navigation |
| Packages disclaimer used low-opacity small text | Medium | Solid semantic secondary text color |
| Why section's filled badge was inconsistent with editorial section labels | Low | Existing copy rendered as shared eyebrow |
| Dead pre-rebrand logo rules retained an obsolete brown and duplicated layout foundations | Low | Verified unused rules removed; Container and Section consume shared rail/rhythm tokens |
| Gallery dialog lacked explicit description handling | Low | Retain accessible title; explicitly omit unused description reference |

## Intentional non-changes

- Keep cinematic slideshow, existing photographs/crops, desktop experience selector, mobile accordion, package rows, Restaurant 3:2 composition, Gallery grid and mobile strip.
- Preserve all source logo artwork; no generated/reinterpreted logo or photography.
- The earlier green editorial palette was superseded by the official refresh below; the warm light canvas remains.
- Preserve canonical request shape, domain rules, validators, participants, packages, times, idempotency, submission and public API semantics. Frontend presentation and editing composition were deliberately improved.
- The initial design-only pass preserved backend/data. The later duration continuation below adds a migration, canonical estimate model and notification fields without changing business facts.
- Existing empty reviews produce no fabricated testimonials.
- Existing generic anchor implementation remains byte-identical.

## Verification and remaining decisions

See `PHASE_5_UI_FINAL_STATUS.md` for measured checks and release blockers. This is a practical visual/accessibility pass, not an independent WCAG certification or linguistic review.

Client decisions still required by the existing data/docs: replace marked mock contact/address/package/restaurant facts with approved content; supply missing About, Contact, Privacy and Terms pages. No facts or legal copy were invented in this pass. Unavailable destinations are now removed by the continuation below; approved content is still needed before publishing those pages.

## Duration / release-cleanup continuation

| Finding | Severity | Implemented resolution |
| --- | --- | --- |
| No approved duration tiers; legacy prices are mock | High | Empty approved-tier arrays, canonical duration/pricing architecture and explicit pending UI; no extrapolation |
| Visit had no estimate/provenance context | High | Item subtotals and overall estimate/pending in summary and Review, with manager-confirmation disclaimer |
| Closing-time slots ignored selected activity length | High | Shared duration-aware slot filter and server validation; invalid late start clears on duration change |
| Historical estimate could change with catalog | High | Server-owned immutable snapshot persisted atomically with booking/outbox |
| Public Footer/map exposed mock phone, WhatsApp and address | High | Conditional rendering based on provenance flags; no mock contact links or directions |
| About/Contact/Privacy/Terms links pointed to absent routes | High | Remove unavailable shared-nav destinations; no invented legal content |
| Restaurant CTA implied unsupported reservations | High | Truthful localized visit-planning CTA |
| Farm-to-table / wood-fired sauna claims lack canonical evidence | Medium | Neutral restaurant/sauna copy in all four locales |
| Skip link was English-only | Medium | Localized accessible link in EN/RU/TH/ZH |
| Navigation order did not match client requirement | Medium | Reorder the one shared source; Header, menu and Footer inherit it |

Remaining client decisions: approved duration-price pairs and billing basis for Horse Riding, Pony Riding, ATV and Sauna; confirmed package contents/price/billing basis; verified contacts/address/directions; approved legal content. Existing pending package contents remain clearly described as illustrative. No replacements or business claims were invented.

## NEW OFFICIAL BRAND REFRESH

The October 10 “on ground · KHAO MAI KAEO” photograph supersedes the prior horse logo and #84250F/#F4D2A6/#253D32 visual treatment. The new original is retained intact; a proportional wordmark crop and source-lettering icons replace active old derivatives. The sampled palette is #B16545/#F0DCC2 with explicitly documented accessible derived controls and umber surfaces.

Updated Header, sticky/mobile menu, Footer, buttons, shared forms, homepage editorial colors, booking selected/editor/progress/summary/review/receipt colors and generated icon metadata. Small Header/menu navigation uses a darker text companion because body ink on the sampled terracotta did not reach 4.5:1. Existing photography, typography, Restaurant composition and layout hierarchy were retained.

Preserved textual ON GROUND CAFE & FARM, internal identifiers, navigation order, repeated anchors, Booking V2/Your Visit, pending duration/pricing, snapshots, mock-data suppression, API/domain/DB/outbox/provider code. No tier, business fact or backend migration was added. See `BRAND_REFRESH_STATUS.md` for current measured QA.

The final control pass replaces the default language-selector border with the semantic control boundary. Its actual contrast against the pale menu improves from 1.52:1 to 3.40:1. EN/RU/TH/ZH mobile selector focus and Review were checked at 375/390/430px; no locale or booking behavior changed.
