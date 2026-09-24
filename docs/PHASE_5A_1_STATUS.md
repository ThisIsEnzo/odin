# Phase 5A.1 — Modern Visual Redesign

## Status

COMPLETE

The frontend visual phase and browser review are complete. No blocking frontend regression remains in the reviewed layouts. This is not a declaration of production build readiness: the pre-existing TypeScript, ESLint and dependency lockfile issues listed below remain outside this phase. Phase 5B was not started.

## Visual audit

The previous homepage used a heavy frosted hero panel, traditional serif headings, small section titles, repeated rounded cards and largely uniform beige surfaces. Package cards resembled generic pricing tiles. Missing image and logo assets prevented a complete presentation. Only one hero source was connected, and gallery descriptions did not match the supplied images.

## New design direction

A contemporary sans-led editorial layout: warm ivory, deep green, restrained terracotta actions, large photographs, strong display hierarchy, fine dividers and numbered content. Existing Inter / Noto Thai / Noto Chinese families support the four locales. Motion remains restrained and honors reduced-motion preferences.

## Assets

Authoritative logo: `public/images/brand/odin-logo.jpg`, copied byte-for-byte from `odin-logo(2).jpg`. The complete supplied artwork is used in Header, MobileNav and Footer; no invented icon or cropped replacement is required.

| Destination | Use |
| --- | --- |
| `public/images/hero/odin-hero.jpg` | Hero slide 1: horse and stable |
| `public/images/hero/odin-hero-2.jpg` | Hero slide 2: countryside; Final CTA |
| `public/images/hero/odin-hero-3.jpg` | Hero slide 3: restaurant terrace |
| `public/images/experiences/odin-horse.jpg` | Horse Riding |
| `public/images/experiences/odin-pony.jpg` | Pony Riding |
| `public/images/experiences/odin-atv.jpg` | ATV |
| `public/images/experiences/odin-sauna.jpg` | Sauna |
| `public/images/restaurant/odin-restaurant.jpg` | Restaurant scene |
| `public/images/gallery/odin-gallery-01.jpg` | Paths and paddocks |
| `public/images/gallery/odin-gallery-02.jpg` | Grazing horses |
| `public/images/gallery/odin-gallery-03.jpg` | Leather saddle |
| `public/images/gallery/odin-gallery-04.jpg` | Evening countryside |
| `public/images/gallery/odin-gallery-05.jpg` | Visitors beside a paddock |

All 13 JPGs came from the supplied `images.zip`. The two supplied placeholder SVGs remain available for existing canonical fallback references, while the displayed homepage uses the JPGs. Image paths exist. No generated replacement or testimonial was introduced. The supplied images are not independently verified documentary photography; the master handoff identifies the earlier set as concept assets.

## Major changes

- **Header / MobileNav / Footer:** original logo integrated, refined navigation, compact scrolled header, prominent Book action and deliberately styled mobile menu.
- **Hero:** heavy panel removed; localized concise headline over photography; three slides, numbered controls, previous/next and pause.
- **Experiences:** numbered desktop selector and immersive active visual; vertical expanding mobile panels. Inactive panels cannot receive keyboard focus. Canonical booking IDs retained.
- **Why ODIN:** numbered typography and separators.
- **Packages:** editorial rows with original package URL context and mock-data notices.
- **Restaurant:** large cinematic image with a dark-green overlapping content section.
- **Gallery:** asymmetric photographic grid, mobile snap strip, corrected multilingual image descriptions, existing lightbox retained.
- **Reviews / Location:** honest empty review state, lighter presentation and existing Maps directions destination logic.
- **FAQ:** refined spacing and separators; missing distance interpolation corrected using canonical siteConfig.
- **Final CTA:** photographic closing scene and working booking / experience actions.
- **Design system:** consolidated terracotta tokens, sans-led typography, shared terracotta primary buttons and multilingual fallbacks.

### Final continuation fixes

Only `src/components/layout/Footer.tsx` required additional visual adjustments during this continuation:

- Legal links now wrap, fixing Russian horizontal overflow at 1024px.
- Language select text, border and focus treatment contrast with the dark footer; option backgrounds remain readable.

The earlier tablet footer two-column adjustment was already present when this continuation began and was retained. Translations were not rewritten during this continuation.

The incidental `npm install` lockfile rewrite affected 114 package records and was not required by the redesign. The original `package-lock.json` was restored. Both dependency manifests are byte-identical to the baseline; installed dependencies were retained locally only for verification.

## Responsive verification

Actual Chromium browser review covered:

| Locale | Widths checked for document overflow and rendering |
| --- | --- |
| EN | 375, 390, 430, 768, 1024, 1440 px |
| RU | 375, 390, 430, 768, 1024, 1440 px |
| TH | 375, 390, 430, 768, 1024, 1440 px |
| ZH | 375, 390, 430, 768, 1024, 1440 px |

Visual inspection prioritized EN desktop/mobile, RU/TH/ZH at 390px, plus EN hero/gallery/footer at 375, 430, 768 and 1024px. Header, hero controls and readability, typography, Experiences, Packages, Restaurant, Gallery, Location, FAQ, Final CTA, Footer and mobile navigation were reviewed. Gallery images were checked after loading rather than judging an incomplete full-page screenshot.

No accidental document horizontal scroll remained in the final four-language/six-width matrix. Thai and Chinese were rechecked with actual Noto glyphs, not just missing-glyph boxes.

Google Fonts fetching is unreliable in this sandbox. Final browser checks used the unchanged app with the Webpack dev server and Next's test-only font-fetch hook supplying local copies of Inter / Noto Sans Thai / Noto Sans SC. Those QA-only font packages, scripts and environment settings are NOT included in the archive and do not alter project dependencies or its font configuration. This verifies font-supported layout, not external Google Fonts availability.

### Interaction checks passed

- Clicked primary homepage anchors for Experiences, Restaurant, Packages, Gallery and Location; waited for smooth scrolling to settle and confirmed target positioning.
- Book CTA navigates to `/en/book`.
- Hero next control, numbered selection, pause state and automatic slide change work.
- Reduced-motion mode stops automatic slide changes.
- Mobile menu opens and closes on anchor navigation; active mobile Experience changes.
- All four Experience CTA URLs preserve canonical IDs. Booking pages select Horse Riding, Pony Riding, ATV and Sauna correctly.
- Package URLs retain their slug; the Family Day booking page retains context-driven experience preselection.
- GalleryLightbox opens, ArrowRight changes the image, Escape closes it.
- FAQ opens using keyboard Enter.
- Maps link retains the Google Maps directions URL. External map destination accuracy was not independently revalidated.
- No browser page errors occurred in the completed interaction run.

## Automated verification

### PASSED

- `npm install --ignore-scripts`: completed in the implementation stage; installed 480 packages. Its incidental lockfile changes were subsequently discarded as described above.
- `npm test`: 39 booking-rules/schema unit tests passed across two files in the implementation stage, using Vitest 2.1.9. No booking source changed afterwards. The original configuration excludes component tests; they are not claimed as run.
- `python scripts/check_i18n_parity.py`: passed again at completion; 179 keys identical across EN/RU/TH/ZH. Existing keys preserved.
- Chromium browser checks described above completed, including the final multilingual matrix and interactions.
- Static image-path audit passed: no missing literal `/images/` reference; no `odin-logo-icon.jpg` dependency remains in active source.
- Byte comparison passed for 23 protected API, booking, schema, type and business-data files: all identical to the baseline archive.
- `package.json` and `package-lock.json` are byte-identical to baseline in the final deliverable.
- Final archive entries were compared byte-for-byte with the working project; modified source and this status document are included.

### BLOCKED / BASELINE ISSUES

- `npm ci`: original lockfile mismatch. The baseline lockfile records Vitest 4 while package.json requests Vitest 2. No dependency repair is shipped in this visual phase.
- `npm run typecheck`: pre-existing booking/test errors, including Zod issue path types, strict indexed access and test matcher types. The same failures were reproduced in the untouched baseline using identical installed dependencies. No errors were reported in the redesigned frontend files after the Gallery/Reveal fixes.
- `npm run lint`: original ESLint configuration fails with circular-structure serialization, reproduced in the untouched baseline.
- `npm run build`: compilation succeeded, then type checking failed on baseline booking/test errors. Full build success is NOT claimed. No type-check bypass was added.
- Google Fonts network access remains an environment limitation; offline test-only font provisioning was used for the final visual review.

## Scope integrity

Backend, booking business rules, schema architecture, repository, notifications, API behavior, persistence, statuses, domain types and canonical business facts were NOT changed. Confirmed hours/weight limits remain unchanged. Reviews data remains the original empty array. No CRM, database, payment, account or availability functionality was added.

## Remaining issues

- The original lockfile, booking/test TypeScript errors and ESLint configuration need a separately scoped repair before a clean production build.
- Normal Google Fonts retrieval could not be guaranteed in this sandbox.
- Existing `/about`, `/contact`, `/privacy` and `/terms` routes remain unimplemented.
- Existing mock contact/location/package/restaurant details require business confirmation before launch.
- Production backend remains the existing in-memory repository and console notification adapter, intentionally outside this phase.

## Deliverable

`odin-web-phase5a1-modern-redesign.zip` contains the complete project under `odin-web/`, including source, configuration, integrated images/logo and this status document. It excludes node_modules, .next, review screenshots/scripts, source archives and generated sandbox-only files.

For local development use Node >=20.9, `npm install`, then `npm run dev`. `npm ci` and the production build retain the known baseline blockers above. Phase 5A.1 stops here.
