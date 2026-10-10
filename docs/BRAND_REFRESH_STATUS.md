# Official brand refresh status

## Recovered delivery

- Continued existing branch `brand/on-ground-khao-mai-kaeo-refresh` and existing open Draft PR #3; no new branch/PR, merge or deployment.
- Recovered remote HEAD `25ef01b85c7ab6ddee5059a0e391460ccb9dcce4`, tree `f873c7625fbe1168ff2ee8f38cce78009ca01f01`, against main `0f9eb3ded5fd653bf20f5b68d56098a45e8a0e0f` before editing. Inspected its history, main diff, design/audit/status documents and production browser rendering.
- Direct Git authentication was unavailable. GitHub connector Git objects supplied the authoritative checkout and publication. All 177 recovered blobs matched GitHub hashes; large photographs were recovered from supplied copies only after exact blob verification. No previous local source/archive code was trusted.
- Existing successful homepage/Booking architecture, locale fonts, navigation order and semantic action/control treatment were retained.

## Extended official identity

- **Primary signature:** ON GROUND / KHAO MAI KAEO actual wordmark. Untouched original retained. Lossless 1224 × 390 transparent WebP extracts the photographed lettering and shaded edges, eliminating the opaque Header rectangle without substitute typography or redraw. Inspected against the material surface for fringes/halos.
- **Secondary mark:** untouched new 1536 × 1536 horse relief JPEG. Cream bounds approximately (277,237)–(1250,1241); highlights, warm bevels and downward/right wall shadows are intentional. Retaining the wall inside a clean seal crop preserves depth better than forced transparency.
- Derivatives: 440px seal WebP, 512px app PNG, 64px icon PNG, 180px Apple icon and 16/32px RGBA favicon ICO. Ring/horse silhouette inspected at small sizes; fine relief naturally reduces at 16px.
- Header and mobile retain the readable primary wordmark, with no competing horse mark. Footer has one 104px circular seal, 24px separation and a 232px wordmark in a deliberate vertical lockup. No repeated horse stamps/watermarks.
- Public textual name ON GROUND CAFE & FARM and internal ODIN identifiers remain; supplied artwork does not independently approve a legal name change.

## Sampled palette and material

Both originals were sampled: wordmark background #B16545 / cream #F0DCC2; horse median background **#AE583A** / cream **#F4E3CA**. Horse colors establish the canonical site family; photographic variation stays in the originals.

- Canonical terra #AE583A; accessible material base #96472D; action/focus #87462F; hover #703824; pressed #592C1D.
- Cream #F4E3CA; main canvas #FCF8F2; soft canvas #F3E8DA; earth #38261F; ink/depth #281B16.
- Secondary #69564C; control border #9B8273; real errors only #991B1B.
- Reusable `.brand-terra-surface`: two very diffuse 2.5% cream/umber radial fields and a tiny inline procedural SVG fractal grain at 2.5% opacity over #96472D. No repeating JPEG wallpaper, heavy bitmap, animation or obvious gradient. Solid/material comparison favored the restrained tactile treatment.
- Material appears selectively in Header, mobile menu heading and Footer. Editorial canvas remains airy; Restaurant retains earth. Header navigation is 15px medium, restrained tracking (reset TH/ZH), underline hover and cream inverse Book CTA. Existing Inter/Noto Sans Thai/Noto Sans SC retained.
- Hours/max-weight metadata share cream/earth pills. Pending pricing is solid secondary on light surfaces and cream on photos. Ordinary restrictions never use error red.
- Post-Hero stats strip removed; Hero flows directly to Experiences.

## Location and contact safety

Canonical frontend config contains exactly **https://maps.app.goo.gl/5SAXfYQpQMktn8fv6?g_st=ac**. Localized external Maps CTA uses it directly, with `noopener noreferrer`; no derived mock-address destination or iframe. Location label Khao Mai Kaeo comes from official artwork. Existing canonical 20km distance retained in Location/Footer, not recreated as a stats strip.

Phone, WhatsApp, LINE, email and textual street address remain hidden behind existing mock flags. Maps listings are not approved contact data. No unconfirmed business fact was invented.

## Booking and backend freeze

Booking presentation inherits the unified palette: progress, selected states, duration choices, editor, forms, summaries, estimates/pending states and CTA hierarchy. Your Visit, activity/package plus extra, one editor, add/edit/duplicate/remove, duration architecture, Manager to confirm, Review and Request Received remain intact. No domain logic redesigned.

Hash verification against recovered HEAD confirms `src/lib`, `src/types`, API routes, Drizzle/migrations, tests, package manifests and locale messages unchanged. PostgreSQL, validation, pricing/duration rules, idempotency, outbox, LINE/WhatsApp and notification processing unchanged. Only business-data change is the supplied Maps URL in `src/data/odin/site.ts`.

## Verification

- `npm test`: **153 tests passed**, 9 files; coverage retained.
- `npm run typecheck`: passed.
- `npm run build`: passed, including four locales and favicon/Apple/icon routes.
- `python scripts/check_i18n_parity.py`: **271 matching keys** EN/RU/TH/ZH; passed.
- `git diff --check`: passed.
- Production Chromium matrix: all **32 combinations** of EN/RU/TH/ZH × 375/390/430/768/1024/1280/1440/1920px passed **456 checks**. Header wordmark, mobile menu/locale/Escape, navigation order, Footer seal, exact Maps CTA, absent contacts/stats, image loading, translated Booking editor, pending duration and overflow checked. No raw translation keys, horizontal overflow or page JavaScript errors.
- Additional **22 passing focused browser checks** cover homepage sections, repeated Location anchor, package plus extra, duplicate/remove, one editor, mobile summary expansion/pending total, keyboard focus, icon metadata, Review and intercepted Request Received. Receipt fixture is local browser interception; no DB/provider side effects.
- Visual review: desktop/mobile Header/menu, complete homepage, Experiences metadata, Location, Footer lockup, EN/RU/TH/ZH typography and Booking editor/review/receipt. Asset rectangle removed; texture understated; horse restrained; design frozen.
- Contrast: cream/material base **5.16:1**, conservative brightest material composite **4.68:1**, cream/action **5.66:1**, cream/earth **11.39:1**, ink/cream **13.26:1**, secondary/canvas **6.54:1**, control border/canvas **3.40:1**, action/editor **5.89:1**. Solid small inverse copy avoids opacity contrast loss. Keyboard Header/form focus is 2px; native controls/menu behavior retained. Targeted accessibility QA, not full certification.
- Prior delivery reported an inherited ESLint FlatCompat circular serialization failure. Its configuration was not changed; lint is not claimed passing.

## Remaining client inputs

Confirm phone, WhatsApp, LINE, email and exact address text if desired. Existing approval needs remain for activity duration/price tiers/billing basis, illustrative packages and legal/business facts. Live environment/provider acceptance remains a separate release task. This visual pass neither invents these facts nor enables contacts.
