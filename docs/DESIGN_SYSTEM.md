# ON GROUND design system

Final corrective pass on brand/on-ground-khao-mai-kaeo-refresh. Recovered GitHub parent: 6bf2421ee65f7e7518627584fbf094d4c05a4a52.

## Official identity

The supplied logo-title.jpg and logo-horse.jpg are preserved byte-for-byte in public/images/brand. Primary signature: ON GROUND / KHAO MAI KAEO. Secondary mark: circular horse relief. No lettering is retyped and no horse geometry is redrawn.

on-ground-title-relief.svg embeds the exact logo-title.jpg bytes with a proportional crop (170,230), 1270×400 from the 1600×857 original. An sRGB color matrix changes alpha only, using the green/red difference to remove terracotta; RGB channels remain the photographed cream faces and bevels. This is a source-pixel SVG wrapper, not generated lettering or a flat-color flood. Header, menu and Footer all use it through BrandLogo.

Shared shadows: .5px 1px .5px at 40% warm ink and 1px 2px 2px at 18%. Close relief depth is restored without a large floating drop shadow. Wordmark widths: 212px desktop, 188px small mobile, 224px menu, 232px Footer, always proportional.

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

.brand-material is one reusable procedural treatment. Its base uses --material-base, defaulting to #96472D; Footer overrides it to #281B16. Two diffuse 2.5% tonal fields and a tiny inline SVG fractal grain at 2.5% opacity supply restrained texture. No tiled JPEG, external texture request, animation or obvious grunge. Selective use: Header, menu heading, Footer.

Header height is 88px at rest and 76px after scrolling, with a restrained sticky shadow. Desktop nav starts at 1280px in the approved order: Experiences → Packages → Restaurant → Gallery → Location. Links use 16px medium type, .02em tracking and underline/border hover; Thai/Chinese reset tracking. Language selector uses a quiet cream bottom rule; Book Now uses the shared cream inverse action. Smaller widths retain the accessible menu with booking/language access.

## Typography, grid and accessibility

Inter covers Latin/Cyrillic; Noto Sans Thai and Noto Sans SC remain locale fallbacks. No ornamental font added. Hero structure, slideshow, photograph, overlay and typography are preserved. Hero transitions directly to Experiences; the deleted statistics strip stays absent.

Shared 1280px rail; gutters 20/32/48px at mobile/640/1024px. Section rhythm remains 72/96/112px. Booking headings share homepage scales/tokens. Restaurant, Gallery and Location retain their architecture.

Interactive controls, including Footer links, have 44px minimum target height. Booking fields have 48px minimum height, 16px text, semantic borders, visible contextual focus and associated labels/errors. Reduced-motion rules, native controls/disclosure and Radix keyboard menu are retained. Targeted QA is not independent accessibility certification.

## Offer information

OfferFacts is shared by homepage experiences and Booking discovery. Every experience shows Duration and Price before adding. Confirmed duration tiers show localized minutes and a minimum THB offer with billing unit. Legacy numeric prices appear only when provenance confirms them. Packages have a distinct Package label, component list, price row and illustrative-content notice.

Current canonical data has no approved tiers and all prices/packages are mock. Duration and price therefore show localized Manager to confirm. Slot interval never becomes activity duration. No price, duration or billing quantity is fabricated.

## Visit planning

Discover → add → configure → save → collapsed itinerary. Added/editing/ready/details-needed states remain explicit. One item editor is open at a time. Within a package, VisitItemEditor opens exactly one component form; other components remain visible as itinerary rows. Component selectors expose expanded state; validation opens the component needing details.

Date and Start time belong to each activity. Stage help explains different starts within one visit; field help states Thailand local time. Opening hours are labelled as opening hours, without technical slot-generation copy. Duration-aware slots and request payload are unchanged.

Desktop has a sticky Your visit summary. Mobile uses a native disclosure open by default. Entries show name, date, labelled start time, labelled duration/pending, guests, supplied weights, subtotal and readiness. Add another experience is visible and returns to discovery without dropping prior entries. Package and extra are separate numbered items.

Canonical estimates are reused: numeric total only if every required line is known; otherwise Manager to confirm. Package components are never double charged. Final-price manager disclaimer remains beside the estimate. Review shows itinerary/contact details; Request received preserves request semantics and focuses its heading. No invented visit-end time when duration is unknown.

## Location and technical boundary

Approved Maps link: https://maps.app.goo.gl/5SAXfYQpQMktn8fv6?g_st=ac. Unconfirmed phone, WhatsApp, LINE, email and textual address remain suppressed.

Backend, catalog facts, pricing, slots, validation, API, PostgreSQL, Drizzle/migrations, idempotency, outbox and providers are unchanged. Actual verification is recorded in BRAND_REFRESH_STATUS.md.
