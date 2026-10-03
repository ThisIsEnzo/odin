# Phase 5C.1 — Premium UI polish + i18n hardening

## Status and source

COMPLETE for the scoped frontend presentation/i18n work. This does not sign off the separate Phase 5C production infrastructure prerequisites.

Authoritative source: `odin-web-phase5c-production-backend.zip`. The project was extracted from that archive; no older archive supplied replacement application files. The supplied master handoff and Phase 5C/5B/5A.1 status and architecture documents were inspected.

## Initial findings

- Booking V2 requested `experiences.*.name` and `packages.*.name`, but every locale defines the canonical labels at `.title`. Missing-key fallback therefore exposed raw keys.
- Original logo had large internal margins and appeared as a small rectangular JPEG.
- FAQ and restaurant used independent width/gutter rules; hero controls sat at viewport edges instead of the content rail.
- Gallery had a dominant tall image with narrow, poorly balanced supporting columns.
- Empty reviews rendered a coming-soon area beside Location.
- Oversized headings, large experience panel, package numbering and uneven gutters weakened hierarchy.

## Logo

All four existing assets were inspected visually: original and odin-logo have wide internal margins; full is tightly cropped around the complete artwork; icon contains the horse/rider alone. Header uses the actual icon in a full-height terracotta brand plaque beside a typographic ODIN/location lockup. Mobile drawer uses the same treatment. Footer uses the full artwork with an intentional terracotta frame. No artwork was generated, removed, recolored or replaced; all image bytes are unchanged.

## Grid and typography

Shared Container now uses a 1280px outer maximum and 20/32/48px responsive gutters. Restaurant inset and hero controls use the same content rail. FAQ aligns to that container with a desktop heading/question split. Sections share 72/96/112px vertical spacing. Existing narrower Booking container remains supported.

Section heading scale is now 32–60px with calmer tracking. Hero measure, section line height, paragraphs, package numerals, and footer column proportions were refined. Existing Inter, Noto Sans Thai and Noto Sans SC configuration is retained. Thai/Chinese headings and eyebrows use appropriate line-height/tracking without forced Latin letter spacing. Actual glyph-supported browser rendering was inspected.

## Homepage changes

- Header: tighter navigation and CTA relationship, deliberate brand plaque, preserved sticky/scrolled state and mobile menu.
- Hero: restrained headline measure, adjusted viewport height/spacing and aligned controls. Existing slideshow timer/state logic is unchanged; manual advance and pause work.
- Experiences: more balanced desktop selector/photo ratio, reduced panel height, refined image/text inset, roomier mobile accordion rows and crops. Canonical CTA IDs and interaction remain intact.
- Why ODIN: balanced editorial columns, consistent divider rail and single vertical pillar rhythm. No generic card grid.
- Packages: compact aligned numbering, stable content/price columns and clearer mobile rows. Business data and mock-price notices unchanged.
- Restaurant: inset uses the shared rail, stronger photo/content overlap and wrapping metadata. Direction and existing photography retained.
- Gallery: five existing photographs in a two-row editorial composition: dominant landscape plus two portraits, followed by two large landscapes. Mobile retains a large-image swipe strip. Existing lightbox is unchanged.
- Reviews/Location: empty real review array hides the testimonial area completely. Location becomes a standalone two-column editorial block with address, distance and directions link. Removed obsolete map-coming-soon sentence in all four translations; existing address/distance values are unchanged.
- FAQ: shared alignment, desktop heading/question split and preserved native disclosure behavior.
- Final CTA: existing photograph, localized Ride/Explore/Relax/Eat eyebrow, controlled headline width and clear CTA hierarchy.
- Footer: actual full logo, revised column proportions, spacing and language/legal grouping.

## I18n fix and Booking freeze

Only five translation-key resolution sites in BookingFlow changed from `.name` to `.title` for experiences/packages. Existing options still use their own `.name` contract. No English labels or duplicate translations were added. A source comparison verified that reversing these five substitutions reproduces the original BookingFlow exactly.

No state/reducer, item/participant/date/package behavior, validation, API request, idempotency, submission, error routing or received semantics changed. `/book` received only shared presentation changes and the permitted translation-label fix.

## Browser and responsive QA

Actual local Chromium/Playwright QA used the stock production build, actual fonts and images. QA dependencies/binaries/scripts live outside the app and are excluded from the deliverable. Browser and server were launched in the same permitted process network context. Initial standard Chromium download/OS package installation failed; an independently installed npm Chromium binary was used successfully. No app dependency or font workaround is shipped.

| Locale | Homepage widths | Booking label/overflow check |
| --- | --- | --- |
| EN | 375, 390, 430, 768, 1024, 1440 | 390px |
| RU | 375, 390, 430, 768, 1024, 1440 | 390px |
| TH | 375, 390, 430, 768, 1024, 1440 | 390px |
| ZH | 375, 390, 430, 768, 1024, 1440 | 390px |

All 24 homepage combinations and four booking renders had no document horizontal overflow and no rendered raw keys matching experiences/packages/booking/home/faq patterns. Font loading completed. No page JavaScript errors occurred. Visual review covered EN 1440 and 390, RU/TH/ZH 390, plus EN 375/430/768/1024; reviewed hero, experiences, editorial content, packages, restaurant, gallery, location, FAQ, CTA and footer. Focused section captures verified multilingual text wrapping.

Initial fast full-page captures showed lazy images before they loaded; these were not treated as broken assets or final visual evidence. Focused gallery checks scrolled images into view and waited for loading: all five desktop photos have valid natural widths, and all five mobile strip images decoded successfully after horizontal scrolling. Final gallery composition was visually inspected after loading.

Interactions passed: hero next/pause, desktop experience selection, mobile experience expansion, mobile menu navigation, lightbox open/ArrowRight/Escape and FAQ disclosure. Normal-motion gallery reveal also passed. Package-plus-activity configuration labels were checked in all four locales. No booking request or external notification was sent.

## Automated verification

- `npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=20000`: passed, 511 packages installed.
- `npm test`: passed, 120 tests in 5 files.
- `npm run typecheck`: passed, including after final mobile brand refinement.
- `npm run build`: passed, stock Turbopack compilation, TypeScript and 12/12 static pages; repeated after final mobile brand refinement. No font mocks, checking bypass or dependency changes.
- `python scripts/check_i18n_parity.py`: passed, 222 keys identical across EN/RU/TH/ZH.
- Byte comparison: 45 protected files identical to the source archive, including every API, booking library, DB, validation, domain type, Drizzle file, existing test, canonical business-data file and dependency manifest/lockfile.
- All original image assets retained byte-identically.
- BookingFlow changes restricted to the five label-key substitutions described above.

## Phase 5C infrastructure integrity

Preserved unchanged: Booking V2, PostgreSQL repository, Drizzle schema/migrations, runtime/submit/idempotency, transactional outbox, LINE and WhatsApp providers, notification processor, API routes and tests. No production DB calls/migrations, infrastructure redesign or provider messages were performed. Real PostgreSQL/provider sign-off remains as described in PHASE_5C_STATUS.md.

## Existing limitations outside this phase

- About, Contact, Privacy and Terms routes remain absent; browser prefetch returned their existing 404s. Links were not silently replaced with invented pages or legal copy.
- Address/contact details and some package/pricing facts remain marked mock in source and require business confirmation before launch.
- Existing unrelated ESLint configuration issue was not repaired or re-run; no lint pass is claimed.
- Browser checks are scoped presentation/i18n sanity checks, not complete Booking V2 submission or production infrastructure acceptance.

## Deliverable

`odin-web-phase5c1-premium-polish.zip` contains the entire current `odin-web/` source tree, preserved backend, migrations, tests, production images, existing docs and this status report. Excludes node_modules, .next, screenshots, previous ZIPs, logs, checkpoints, tsbuildinfo, actual .env and temporary browser files. Archive CRC and byte-for-byte comparison against the final working files were verified after creation.
