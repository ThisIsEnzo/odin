# Phase 5C.3 — ON GROUND rebrand

## Status and source
COMPLETE for the targeted rebrand. Continued the existing Phase 5C.2 working tree associated with `odin-web-phase5c2-restaurant-anchor-fix.zip`; no older application tree was restored.

Source archive limitation discovered during final packaging: the available Phase 5C.2 ZIP is truncated at gallery image 05 and lacks its central directory. Its first 45 entries can be decoded with valid CRCs, including PHASE_5C_2_STATUS.md. A complete byte comparison against that ZIP is therefore impossible. The complete current working tree is packaged, and protected backend files were independently compared to the intact Phase 5C production source. Phase 5C.2 Restaurant and anchor behavior were inspected and verified in the browser. This limitation does not apply to the final Phase 5C.3 archive, whose CRC and every entry are verified.

## Brand and assets
ODIN → ON GROUND CAFE & FARM; short display name ON GROUND.
Authoritative artwork: supplied `photo_2026-10-01_11-53-12(1).jpg`. Its untouched bytes are preserved as `public/images/brand/on-ground-logo-original.jpg`.

Production derivatives in the same directory:
- on-ground-logo-crop.svg
- on-ground-mark-crop.svg
- on-ground-wordmark-crop.svg
- on-ground-logo-transparent.svg
- on-ground-mark-transparent.svg
- on-ground-wordmark-transparent.svg

SVGs embed the supplied raster artwork. Crop viewBoxes remove empty margins; native SVG color/alpha filtering separates cream artwork from terracotta. These are not vector tracings or newly drawn artwork. Original rider/horse contours and original lettering are retained with undistorted aspect ratios. Existing production photographs and legacy image files remain byte-identical; legacy logos are no longer rendered.

## Header, mobile and Footer
Header uses deep green, cream source artwork/navigation and terracotta booking CTA, with a compact sticky/scrolled variant and no glass blur. BrandLogo combines source mark and lettering horizontally; desktop navigation begins at 1024px, Header language selector at 1280px. Footer language selection remains available at all sizes.

Mobile uses the real compact brand and menu control; the Header CTA is hidden below 640px to avoid crowding. The menu retains its booking action and language controls, with the new brand on a green panel.

Footer uses the larger full source logo, updated copyright and accessible business name. Existing mock ODIN email/LINE links are hidden pending confirmed replacement contacts; no new endpoint was invented and underlying configuration/provider behavior is unchanged. Other contact data retains its existing mock status.

## Public text and metadata
Updated customer-facing brand strings in EN/RU/TH/ZH translations, Restaurant eyebrow and siteConfig.businessName. Existing metadata title/description structure remains localized and uses the full new brand. Brand accessibility label is ON GROUND CAFE & FARM. Existing translation keys, source paths, API identifiers and historical documentation remain unchanged. No existing OpenGraph-specific configuration or JSON-LD required migration; no broader SEO work added.

Added `src/app/icon.svg` using the actual source rider mark on deep green. No prior dedicated favicon was present.

## Booking reference prefix
UNCHANGED: `ODIN-`. The generated operational booking reference is not a cosmetic presentation label. Changing it could affect persisted reference compatibility. Booking behavior, reference generation and notification infrastructure were not modified; this is an intentional exception to removal of public brand text.

## Phase 5C.2 preserved
Restaurant retains its desktop 3:2 photo/panel grid, 620px minimum height, mobile stacking, original photography and omission of unconfirmed spend. Only the brand eyebrow changed.
HomepageAnchorNavigation remains mounted in the locale layout with delegated same-page capture, repeated same-hash scrolling, conditional history updates and two animation frames for mobile dialog cleanup. Cross-route localized navigation remains intact.

## Verification
- `npm run typecheck`: passed.
- `npm test`: 120 tests passed across 5 files.
- `npm run build`: passed; 13/13 static pages generated, including icon.svg.
- `python scripts/check_i18n_parity.py`: passed; 222 matching keys across four locales.
- Actual Chromium production-build QA: EN/RU/TH/ZH at 375, 390, 430, 768, 1024 and 1440px. No document overflow, old visible brand or page JavaScript errors. New localized titles verified.
- Header/Hero, Footer, compact/scrolled Header and mobile menu screenshots reviewed. Source artwork and lettering remain legible at rendered sizes.
- All six section navigation targets and repeated same-hash clicks passed with header clearance. Mobile drawer cross-route/repeat Restaurant navigation, locale selector, Book Now and four localized /book renders passed.
- QA scripts and screenshots are outside the application and excluded from the deliverable.

## Backend and domain protection
37 protected infrastructure/test/dependency files match the intact Phase 5C production ZIP byte-for-byte: all API routes, booking libraries, PostgreSQL repository, DB schema/client, validation, domain types, migrations/Drizzle, outbox, LINE/WhatsApp providers, tests and dependency manifests.
Seven Booking UI/route files match the intact Phase 5C.1 archive byte-for-byte (Phase 5C.2 documented these unchanged). Canonical data is byte-identical except the explicit businessName change. All 19 original public assets remain byte-identical. Uploaded new logo source is also byte-identical.
No database migration, live provider call or booking submission performed. Existing real infrastructure acceptance prerequisites and absent informational/legal routes remain outside this phase. No new lint pass claimed.

## Deliverable
`on-ground-web-phase5c3-rebrand.zip` contains the full current application, all prior status docs plus this report, Booking V2, current backend/migrations/providers and all production images/new logo assets. Internal root folder remains `odin-web/` intentionally.
Excludes dependencies, build output, actual .env files, screenshots, logs, previous archives and temporary files. Includes .env.example only. Final ZIP CRC and entry bytes checked against the current working tree; required Phase 5C.2/5C.3 docs, Header/MobileNav/Footer, Restaurant and anchor implementation explicitly verified.
