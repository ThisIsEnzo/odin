# ON GROUND design system

Final corrective pass on brand/on-ground-khao-mai-kaeo-refresh. Focused polish parent: e01a0b931c452b1e6d10138c9d7fc26f4aaf4b69.

## Official identity

The supplied logo-title.jpg and logo-horse.jpg are preserved byte-for-byte in public/images/brand. Primary signature: ON GROUND / KHAO MAI KAEO. Secondary mark: circular horse relief. No lettering is retyped and no horse geometry is redrawn.

Header, menu and Footer share a 1270 × 400 transparent lossless WebP (`on-ground-wordmark.webp`, 116,588 bytes), with RGBA PNG fallback (`on-ground-wordmark.png`, 195,716 bytes). Both are freshly rendered from the exact original high-resolution JPEG, not an upscaled old cutout. The 1270px intrinsic width exceeds 3× the largest 250px signature display. Browser code uses a picture/source/img element with explicit dimensions and asynchronous decoding; no runtime SVG filter.

`on-ground-title-relief.svg` is the reproducible source-pixel master: exact embedded title JPEG, original proportional crop (170,230), 1270 × 400. Its sRGB green/red alpha matte separates cream from wall; a 0.85px mask expansion and (0.5px,2px) offset retain the narrow photographed bevel and prevent transparent pinholes in the faces. Final color comes from SourceGraphic through this mask: original letter RGB, no replacement type, vector tracing or flat-color flood. The master is rasterized once at intrinsic resolution for stable browser antialiasing. PNG/WebP alpha channels are verified identical, with all four outside borders fully transparent and no rectangular matte. Letter counters remain transparent.

Shared shadows remain .5px 1px .5px at 40% warm ink and 1px 2px 2px at 18%. They complement retained source relief without a glowing/oversized drop shadow. Display widths remain 212px desktop, 188px small mobile, 224px menu and 232px Footer, always proportional.

The horse seal uses the exact uploaded logo-horse.jpg, cropped in CSS inside an 88px circular frame. The image occupies 140% of the frame with a centered crop, retaining cream relief and its natural wall/shadow. Built-in transparent extraction previews were inspected and excluded because they changed edge/bevel character. No generated preview is a production asset.

Footer lockup: 232px maximum width, centered seal/signature, 20px vertical spacing and a 3px optical correction on the seal. Brand copy is centered within this column; the column follows the page rail. Header uses the primary signature alone. Existing horse favicon/app assets remain.

## Palette

| Token | HEX | Usage |
| --- | --- | --- |
| brand-accent | #AE583A | Mineral terracotta reference |
| brand-terra-deep | #96472D | Header/menu material base |
| brand-primary / focus | #87462F | Actions and selections |
| brand-primary-hover | #703824 | Hover |
| brand-primary-active | #592C1D | Pressed |
| brand-cream | #F4E3CA | Cream typography/inverse actions |
| canvas | #FCF8F2 | Main canvas |
| canvas-soft | #F3E8DA | Quiet sections/editor |
| surface-dark | #38261F | Restaurant/editorial earth |
| surface-deep / ink | #281B16 | Footer base/primary text |
| text-secondary | #69564C | Metadata/pending copy |
| border | #9B8273 | Control boundaries |
| error | #991B1B | Actual errors only |

Terracotta is a reference family, not a compulsory fill for every brand surface. Footer returns to dark warm earth. Ordinary rider restrictions never use error red.

## Material and navigation

.brand-material is one reusable stationary mineral-plaster treatment. Base --material-base defaults to #96472D; Footer remains #281B16. A 512px inline procedural SVG blends stitched fractal fields (.065/.11, four octaves; .32/.48, two octaves) and shades their relief with feDiffuseLighting: surfaceScale .9, diffuseConstant .85, distant light azimuth 235° / elevation 48°. A linear channel adjustment (slope 1.6, intercept -.35), 6% alpha and CSS soft-light blend keep the fine relief subordinate to typography. Diffuse cream/ink fields (2.5%/6.5%) and a 1.5–2.5% diagonal light variation avoid a flat overlay. No photographed wall tile, multi-megabyte texture, animation, external request or dependency. Used only on Header, menu heading and Footer. Source artwork and rendered 1×/3× surfaces are compared visually; the final relief is weaker than the first trial.


Header height is 88px at rest and 76px after scrolling, with a restrained sticky shadow. Desktop nav starts at 1280px in the approved order: Experiences → Packages → Restaurant → Gallery → Location. Links use 16px medium type, .02em tracking and underline/border hover; Thai/Chinese reset tracking. Language selector uses a quiet cream bottom rule; Book Now uses the shared cream inverse action. Smaller widths retain the accessible menu with booking/language access.

## Typography, grid and accessibility

Inter covers Latin/Cyrillic; Noto Sans Thai and Noto Sans SC remain locale fallbacks. No ornamental font added. Hero structure, slideshow, photograph, overlay and typography are preserved. Hero transitions directly to Experiences; the deleted statistics strip stays absent.

Shared 1280px rail; gutters 20/32/48px at mobile/640/1024px. Section rhythm remains 72/96/112px. Booking headings share homepage scales/tokens. Restaurant and Gallery retain their architecture. Location alone gains the requested editorial map split.

Interactive controls, including Footer links, have 44px minimum target height. Booking fields have 48px minimum height, 16px text, semantic borders, visible contextual focus and associated labels/errors. Reduced-motion rules, native controls/disclosure and Radix keyboard menu are retained. Targeted QA is not independent accessibility certification.

## Booking V3 — hospitality request

One calm content column with visit/contact fields at the top, catalog-driven editorial experience cards, one optional note and Review request. No progress wizard, sticky cart/sidebar or per-activity time/weight fields. Wide desktop uses a two-column card grid (1024px+), with independently sized cards; mobile/tablet uses one column. Review is the only second screen, followed by Request received.

Cards use existing activity photographs, square frames, brand borders and cream/canvas surfaces. An included badge with check, stronger border and expanded configuration make selection explicit. Remove resets the card. Weight maxima are noticeable sand/cream information, never red warnings. Guest/unit steppers and duration buttons use 48px touch targets; inputs use 52px height and 16px text. Controls wrap naturally without a carousel or overlay. Focus and linked error summaries support keyboard correction.

Visit date and preferred arrival time appear once. Copy explains Thailand local time and manager-confirmed internal timing. Horse/Pony require no entered weights. Generic capacity-unit controls support five guests with three/four/five ATVs. Duration controls render approved tiers only; absent tiers display Manager to confirm. Current all-empty tiers and mock prices remain pending.

Review groups visit, contact, numbered experiences, notes and estimated total as editorial sections. Edit request restores the full form unchanged. Numeric total appears only when every line is known; otherwise the total is pending. Final-price and request-to-book semantics remain visible. Receipt thanks the visitor in EN/RU/TH/ZH and shows the server reference without asserting availability/payment confirmation or outbound message delivery.

Homepage OfferFacts and the brand/material system remain intact. Mock package CTAs now say Plan a visit and open the activity form; no nested package editor or fabricated package composition is implied. Actual automated checks and the outstanding browser-visual review are recorded in BOOKING_V3_STATUS.md.

## Location and technical boundary

Approved Maps link: https://maps.app.goo.gl/5SAXfYQpQMktn8fv6?g_st=ac. Resolving this exact link identifies ON GROUND CID 2612557755843089553 (0x2441ab6fe0381491). The verified post-redirect embed URL is https://www.google.com/maps/embed?origin=mfe&pb=!1m3!3m2!1m1!4s2612557755843089553. Production uses this direct no-key listing embed rather than a redirecting short URL, inferred name search or guessed coordinates. A source response identified latitude 12.9284015 / longitude 101.0259669; those coordinates are not needed in production code. OpenStreetMap was evaluated but its current export requires WebGL, so the Google listing embed was selected. Google owns the iframe content; no listing address, contacts, hours or reviews are copied into canonical business data. The independent CTA still opens the exact supplied Google URL. Native controls and provider attribution remain visible.

Location places editorial copy beside a 38%/62% map column at desktop, stacked copy → map → CTA on mobile. A thin earth border and soft-canvas loading surface frame the map without extra rounding. Frame heights are 320px mobile / 380px tablet / 420px desktop. Iframe has loading="lazy", a localized accessible title, explicit contained dimensions, no site API key or paid library and strict-origin-when-cross-origin referrer policy. The exact external Maps CTA remains available and keyboard focusable independently of embed loading. Native lazy loading defers third-party resources; this is not a consent-gated map. No performance score improvement is claimed.

Unconfirmed phone, WhatsApp, LINE, email and textual address remain suppressed.

The brand PR’s final identity/material/location are preserved in this stacked Booking PR. V3 changes public request validation/persistence/model and staff text as documented in BOOKING_V3_STATUS.md; outbox transports and retry architecture remain unchanged. BRAND_REFRESH_STATUS.md records historical brand verification, not new Booking visual QA.
