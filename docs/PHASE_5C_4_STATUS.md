# Phase 5C.4 — Brand color harmonization

## Status and source
COMPLETE. Source of truth: `on-ground-web-phase5c3-rebrand.zip`, verified with a valid central directory and CRC. Continued the exact existing application; no older source tree restored.

Initial comparison found one truncated local gallery file (`odin-gallery-01.jpg`, 43,520 bytes versus 3,832,374 source bytes). It was restored byte-for-byte from the authoritative Phase 5C.3 ZIP. All other working files matched that source before this phase.

## Palette grounded in the real logo
Visually inspected the untouched `public/images/brand/on-ground-logo-original.jpg`.
Sampled the artwork region x=65..664, y=430..964 of the 720×1280 RGB source. Median background pixels (R>60, G<85, B<65; 253,469 samples) yield #84250F. Median cream pixels (R>220, G>170, B>120; 60,967 samples) yield #F4D2A6. These are representative flat colors from a textured photograph, not a claim of an official vector brand specification.

CSS tokens:
- terracotta: #84250F (source median)
- cream-brand: #F4D2A6 (source median)
- terracotta-dark: #6A1E0C (derived hover shade)
- terracotta-light: #9D452B (derived lighter shade)

Cream/terracotta contrast is 6.49:1. Source logo JPG and crop derivatives are untouched. Transparent SVG derivatives use the sampled cream flood color; embedded source bytes, masks, crops and original artwork/lettering are retained. Favicon background/cream colors follow the same palette.

## Targeted visual changes
- Desktop/mobile Header: sampled terracotta background, cream source logo and navigation, tonal border and cream focus indicators. Existing proportions, sticky behavior and breakpoints preserved.
- Header booking CTA: solid cream with terracotta text; warm off-white hover and cream focus ring. No terracotta-on-terracotta button.
- Mobile menu: full-width terracotta brand heading with cream close control; ivory navigation surface retained. Existing menu state, language selection and link handling unchanged.
- Footer: terracotta/cream palette, readable secondary text, cream separators/selectors/focus states and underlined link hover.
- Existing terracotta details and selected experience states inherit the sampled accent token. Navigation pressed states use subtle tonal feedback. No new selection or routing behavior introduced.
- Existing green section backgrounds, Restaurant layout, ivory surfaces, photographs, typography and editorial composition retained. Shared Button implementation unchanged.

## Verification
- `npm run typecheck`: passed.
- `npm run build`: passed; 13/13 static pages, stock production build.
- Existing 120-test baseline was not rerun for this color-only phase; tests and domain files are unchanged.
- Chromium against the production build: EN/RU/TH/ZH at 375, 390, 430, 768, 1024 and 1440px (24 combinations). No document overflow, visible old brand or page JavaScript errors. Computed Header/Footer/CTA colors match the new tokens.
- Reviewed desktop Header/Hero and Footer, mobile Header/Hero and mobile menu screenshots.
- All six navigation targets and same-hash repeats passed with sticky-header clearance. Mobile menu cross-route/repeat Restaurant anchors, locale selector, Book Now and localized /book rendering passed.
- QA Chromium initially crashed because the local binary was incomplete. Re-expanded the already-installed binary archive and completed QA; no application dependency change.

## Strict scope protection
Byte comparison against the complete Phase 5C.3 ZIP allows only these eight visual files:
- src/app/globals.css
- src/app/icon.svg
- src/components/layout/Header.tsx
- src/components/layout/MobileNav.tsx
- src/components/layout/Footer.tsx
- public/images/brand/on-ground-logo-transparent.svg
- public/images/brand/on-ground-mark-transparent.svg
- public/images/brand/on-ground-wordmark-transparent.svg

Every other baseline file is byte-identical, including Booking V2 components/routes/domain, all APIs, PostgreSQL/Drizzle/migrations, transactional outbox, LINE/WhatsApp, notification processing, business data, translations, metadata, Restaurant.tsx, HomepageAnchorNavigation.tsx, tests, dependency manifests and all production photographs. Shared palette changes affect accent presentation only. The operational ODIN- reference prefix remains unchanged.

No DB calls, migrations, provider messages or booking submissions performed. Existing launch prerequisites and unrelated missing legal/informational routes remain outside scope.

## Deliverable
`on-ground-web-phase5c4-brand-color-harmonization.zip` includes the full current application and this report, all earlier status docs, all images/logo assets and the complete protected backend. Internal root remains odin-web/.
Dependencies, build output, screenshots, logs, temporary files, previous archives and actual .env files are excluded; .env.example remains included. Final ZIP CRC, complete entry inventory and each entry's bytes verified against the final working tree.
