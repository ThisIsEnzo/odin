# Final corrective brand and Booking pass

## Delivery boundary

Continued `brand/on-ground-khao-mai-kaeo-refresh` and existing open Draft PR #3 against `main`. Authoritative starting HEAD was `6bf2421ee65f7e7518627584fbf094d4c05a4a52`, tree `ca40db59789899b76df336fab6bc249d268c4d51`. Inspected remote history, PR, source, tokens, documents and production homepage/Booking before editing. GitHub connector recovery verified all 183 blob hashes; archive photographs were used only when their hashes exactly matched GitHub. No archive source baseline, new branch/PR, merge or deployment.

## Official artwork

- Untouched supplied `logo-title.jpg` and `logo-horse.jpg` are the production sources.
- Primary signature embeds the exact 1600 × 857 wordmark JPEG in `on-ground-title-relief.svg`. The 1270 × 400 viewBox crops empty wall. An sRGB color matrix separates cream lettering from the terracotta wall while retaining the photographed letter RGB/bevel tones. Two restrained CSS shadows restore depth without a rectangular background or substitute type.
- Transparent horse extraction was compared visually with a seal and rejected because edge/geometry fidelity was worse. Production uses the exact 1254 × 1254 horse JPEG in a circular overflow crop, preserving its cream relief and original wall inside the seal.
- Footer seal is 88px, wordmark 232px, separation 20px. A 3px optical seal offset aligns the visual weight with the wordmark. Header uses the signature alone, 188px mobile / 212px desktop; mobile menu 224px. Earlier assets remain historical and are not the active wordmark/seal.

## Material, Header and homepage

Reusable `.brand-material` combines low-opacity procedural SVG grain and two diffuse 2.5% tonal fields. Header/menu use #96472D; Footer overrides the base to dark warm earth #281B16. No tiled JPEG texture, heavy bitmap or obvious grunge. Cream footer copy and the restrained seal form the closing lockup.

Header spacing, 16px medium navigation, locale tracking, quiet language control, cream Book CTA and compact sticky state are refined. Navigation order remains Experiences, Packages, Restaurant, Gallery, Location. Hero structure is retained; the deleted post-Hero stats strip stays absent. Homepage experience metadata now explicitly presents duration and price/pending values; rider restrictions use neutral styling.

Palette: accent #AE583A; Header material #96472D; action/focus #87462F; hover #703824; pressed #592C1D; cream #F4E3CA; canvas #FCF8F2; soft canvas #F3E8DA; earth #38261F; Footer/ink #281B16; secondary #69564C; control border #9B8273; genuine errors #991B1B. Existing Inter/Noto Sans Thai/Noto Sans SC retained.

## Booking clarification

Shared offer facts appear before adding an experience on both homepage and Booking. Confirmed tiers can show duration and price/billing basis. Current canonical activity tiers are empty and prices/packages are mock, so current offers explicitly show Manager to confirm. No illustrative amount or booking interval is represented as confirmed pricing/duration.

Start time is explicitly labeled, with short help explaining each activity's own start and Thailand local time. Opening hours are distinguished from duration. Configuring package components now mounts only one active activity editor; collapsed components retain their itinerary details, and validation selects the component needing attention.

Your Visit opens by default on mobile and shows activity/package identity, date, start time, duration, guests, relevant weights, subtotal and readiness. Saved entries collapse into an itinerary. Add another experience preserves configured items. Pending totals remain Manager to confirm with the final-price disclaimer; no partial misleading amount or paid/confirmed implication. Package plus extra retains existing pricing/domain rules.

## Business data and backend

Approved Maps URL remains exactly `https://maps.app.goo.gl/5SAXfYQpQMktn8fv6?g_st=ac`. Existing canonical hours/restrictions/location copy are retained. Phone, WhatsApp, LINE, email and textual street address remain hidden by existing mock flags. No business facts invented.

`src/lib`, `src/types`, `src/data`, API routes, Drizzle/migrations, PostgreSQL, server validation, pricing domain, idempotency, outbox, LINE/WhatsApp and notification processing are unchanged from recovered HEAD. Package manifests are unchanged. Only frontend presentation, locale copy, regression tests, official artwork and documentation changed.

## Final verification

- `npm test`: 156 passing tests in 9 files (153 retained plus 3 meaningful Booking regressions).
- `npm run typecheck`: passed.
- `npm run build`: passed, all four locales and existing routes.
- `python scripts/check_i18n_parity.py`: passed, 275 identical keys in EN/RU/TH/ZH.
- `git diff --check`: passed.
- Production Chromium: 32 locale/viewport combinations (EN/RU/TH/ZH × 375/390/430/768/1024/1280/1440/1920px), plus 4 package-and-extra flows. 618 checks passed; zero failures, horizontal overflow or page JavaScript errors. Covered homepage sections, Header/navigation/menu/Escape, Footer alignment/material, explicit offer facts, start-time help, mobile open itinerary, single package component editor, save/add-another, duplicate/remove, Review and Request Received.
- Request Received used an intercepted local browser fixture; no real booking or provider message was sent.
- Visual inspection covered complete desktop/mobile pages, Footer lockup, Booking discovery/editor/itinerary/review/receipt, and RU/TH/ZH mobile typography. Keyboard focus, labeled controls, reduced motion and 44px Footer/component targets checked. Targeted accessibility QA, not a full certification or native-speaker review.
- Inherited ESLint FlatCompat serialization issue is outside this pass; lint is not claimed passing.

## Remaining inputs

Client confirmation is still required for duration tiers, price amounts and billing basis, package details, contact/address and legal/business facts. Live DB/provider acceptance is a separate release task. None of these pending inputs blocks the explicit request-to-book frontend treatment.
