# Phase 5C.2 — Restaurant polish + anchor navigation

## Status
COMPLETE. Based on the exact Phase 5C.1 working tree and verified against `odin-web-phase5c1-premium-polish.zip`. No other phase started.

## Restaurant
Desktop uses a single 60/40 photograph/editorial composition, capped at 1440px and 620px tall at the tested desktop sizes. Content is vertically balanced with a clear eyebrow, heading, description, hours divider and CTA. Mobile/tablet use a clean stacked photo and compact green panel, without overlap. Photography and translations are unchanged. The unconfirmed average-spend figure is omitted from this presentation; canonical business data remains untouched. Only existing confirmed operating hours are displayed as metadata.

## Anchor navigation
Root cause: homepage links relied entirely on Next/hash navigation; clicking an already-current hash after scrolling away did not explicitly request another scroll.

`HomepageAnchorNavigation` is a reusable client-side delegated capture handler mounted in the locale layout. It intercepts unmodified same-page links to actual homepage section IDs, prevents Next's redundant navigation, and always calls `scrollIntoView`. A different hash adds one history entry; a repeated hash adds none. Cross-route links retain normal localized Next navigation. External links, new-tab/modifier clicks, downloads and non-homepage targets are left alone. Two animation frames allow MobileNav to close and release its scroll lock before scrolling. Reduced-motion uses instant scrolling; otherwise smooth scrolling. Existing shared 7rem scroll-margin leaves clearance below the sticky header.

The delegated implementation covers Header, Footer, MobileNav and homepage CTA anchors without duplicating handlers or modifying Booking components.

## Targeted browser verification
Actual Chromium against the stock production build:
- All six targets: Experiences, Packages, Restaurant, Gallery, Location and FAQ. Click, manually scroll away, click the same hash again: passed. Repeated clicks preserve history length.
- Explicit `/en#restaurant` scenario and Gallery repeat: passed.
- `/en/book` -> `/en#restaurant`: passed.
- Mobile menu cross-route and repeated same-hash Restaurant navigation: passed for EN/RU/TH/ZH. Menu closes and locale is retained.
- Target bounding boxes clear the sticky header. Smooth-scroll repeat and reduced-motion instant mode both passed.
- Restaurant EN: 375, 390, 430, 768, 1024, 1440px. RU/TH/ZH: 390, 1024, 1440px. No document overflow, loaded images/fonts and readable translated composition. No browser page errors.
- Full Phase 5C.1 QA matrix was not repeated.

## Checks and scope
- `npm run typecheck`: passed.
- `npm test`: 120/120 passed, 5 files.
- `npm run build`: stock production build passed, 12/12 static pages.
- Phase 5C backend remains byte-identical to the source Phase 5C archive. Booking components/route, translations, business data, tests, dependency manifests and all production images remain byte-identical to Phase 5C.1.
- Existing production infrastructure prerequisites and absent informational/legal routes are unchanged. No DB migration, provider call or booking submission was performed.

## Archive
`odin-web-phase5c2-restaurant-anchor-fix.zip`: complete current project, including all backend infrastructure and both prior status documents. Excludes dependencies, build output, screenshots, logs, ZIPs, actual env files and temporary QA artifacts. CRC, working-tree bytes and protected backend source bytes verified after creation.
