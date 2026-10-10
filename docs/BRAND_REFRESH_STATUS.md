# Final focused brand polish

## Delivery boundary

Continued `brand/on-ground-khao-mai-kaeo-refresh` and existing open Draft PR #3 against `main`. Authoritative starting HEAD: `e01a0b931c452b1e6d10138c9d7fc26f4aaf4b69`; tree `7c61793e7d5145acd5ef494781bbde192c278a7e`. All 188 blobs and the exact commit/tree were recovered and verified. Archive photographs supplied bytes only when Git blob hashes matched GitHub. No archive code baseline, new branch/PR, merge or deployment.

Scope is the four remaining client findings: Location map, Footer transparency, Header wordmark quality and Header/Footer material. Approved homepage composition/navigation, Booking improvements, typography, translations and business logic remain.

## Header and Footer artwork

Original `logo-title.jpg` is preserved unchanged. Fresh production exports are a 1270 × 400 lossless RGBA WebP (116,588 bytes) and PNG fallback (195,716 bytes). Header, menu and Footer use one picture/source/img signature with explicit dimensions and asynchronous decoding. Intrinsic width exceeds 3× all display sizes; no browser upscaling or runtime SVG filtering.

`on-ground-title-relief.svg` is the source-pixel master: exact original JPEG embedded, proportional crop (170,230), sRGB cream/wall alpha separation, narrow 0.85px expansion and (0.5px,2px) offset to retain photographed bevel and fill alpha pinholes. SourceGraphic supplies original letter RGB through the mask; no tracing, redraw or substitute typography. Master rasterization happens once at full intrinsic resolution.

Decoded PNG and WebP alpha planes match: 416,610 zero-alpha pixels and 79,995 opaque pixels; all four outside borders have alpha zero. Letter counters and surrounding wall are transparent. Visual review on dark earth and Header terracotta shows clean edges without a rectangular matte. Existing restrained two-layer CSS shadows complement retained relief.

Horse remains the exact `logo-horse.jpg` in the intentional 88px circular seal, preserving its photographed relief. Footer lockup remains 232px, 20px vertical separation and 3px optical seal correction. The new wordmark's alpha centroid is 646.9px against geometric 634.5px: approximately 2.3px right at Footer display width, supporting the optical seal offset. Header signature remains aligned to the existing rail/heights.

## Tactile surfaces

`.brand-material` uses two stitched procedural mineral fields, fine directional irregularity and diffuse relief lighting, with a 512px repeating SVG data URI rather than a photographed wall tile. SVG scales .065/.11 (four octaves) and .32/.48 (two); surfaceScale .9, diffuseConstant .85, light 235°/48°, linear RGB adjustment 1.6/-.35, alpha 6% and soft-light blend. Cream/ink tonal fields at 2.5%/6.5% and 1.5–2.5% diagonal variance supply matte depth.

Header/menu remain #96472D; Footer remains dark #281B16. Cream #F4E3CA and all other existing palette tokens remain. No animation, texture download or dependency. Stronger trials were reduced after retina visual/contrast inspection. Measured brightest rendered texture samples retain cream-text contrast: Header 4.54:1; Footer 11.56:1. Texture remains fine/subordinate to readable navigation and Footer copy.

## Location map

Resolved the exact client link `https://maps.app.goo.gl/5SAXfYQpQMktn8fv6?g_st=ac` to ON GROUND listing CID `2612557755843089553` (`0x2441ab6fe0381491`). Verified its post-redirect no-key embed URL:

`https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s2612557755843089553`

Production uses this direct iframe URL, avoiding redirect ambiguity and guessed coordinates. Desktop uses approximately 38% editorial copy / 62% map; mobile stacks copy, map and exact Google Maps CTA. Thin earth border, soft-canvas loading surface, square corners and contained 320/380/420px heights integrate it with the existing design.

Iframe has native lazy loading, localized accessible title and strict-origin-when-cross-origin referrer policy. No site API key, paid map dependency or client map library. Provider controls/attribution remain; the exact external CTA stays independently focusable. Third-party content is not consent-gated. No Core Web Vitals score claim.

Google owns the embedded listing card; its address/reviews and other data are not copied into canonical business config. No contacts or address invented. OpenStreetMap was evaluated but its current export requires WebGL; the verified Google listing embed was selected.

## Verification

- `npm test`: 156 passed in 9 files; coverage unchanged.
- `npm run typecheck`: passed.
- `npm run build`: passed on final source, all four locales and existing routes.
- `python scripts/check_i18n_parity.py`: passed; 275 identical keys EN/RU/TH/ZH. Locale files unchanged in this pass.
- `git diff --check`: passed.
- Production Chromium responsive matrix: all 32 combinations of EN/RU/TH/ZH × 375/390/430/768/1024/1280/1440/1920px checked. Header sharpness/intrinsic resolution, height, Footer dark base/material/optical alignment, map dimensions/title/lazy attribute/exact CTA and overflow checked.
- Eight Booking smoke cases (each locale at 375/1440px) passed: existing selection → planning editor, one editor, new shared logo loading and no overflow. No Booking source changes or real requests.
- Focused live Google map checks at 375/1440px verify provider imagery loading; visual inspection confirms the correct ON GROUND pin and responsive controls. Compact Google embeds may paint the place name into map imagery, so validation uses the verified identifier and rendered images rather than DOM-only name matching.
- Final desktop/mobile Header, Footer and Location screenshots inspected at normal and 3× device scale. No clipping, horizontal overflow or application JavaScript errors. Maps CTA focus and localized map title checked. This is targeted accessibility QA, not full certification.
- QA external requests used the environment's outbound transport; no map response or geography was mocked. Software graphics enabled for provider rendering. No booking submission or provider message sent.
- Inherited ESLint FlatCompat issue remains outside scope; lint is not claimed passing.

## Preserved / remaining inputs

Hash/path comparison against starting HEAD confirms Booking components/tests, `messages`, `src/lib`, `src/types`, `src/data`, API routes, PostgreSQL, Drizzle/migrations, validation, pricing/domain rules, idempotency, outbox, LINE/WhatsApp/notifications and package manifests unchanged. Homepage composition outside Location, Hero, navigation and locale fonts retained.

Previous client-input needs remain: approved duration/price tiers and billing basis, packages, contacts/address and legal/business facts. Unconfirmed contacts remain hidden. Live DB/provider acceptance remains a separate release task.
