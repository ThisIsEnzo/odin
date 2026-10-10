# ON GROUND design system

Implemented in `src/app/globals.css`, shared UI components and existing presentation components. This documents the current system, not a proposed framework.

## Official artwork and identity hierarchy

Two client originals are authoritative: the 1536 × 823 ON GROUND / KHAO MAI KAEO wordmark and the 1536 × 1536 circular horse relief. Both original JPEGs remain untouched. Historical logos remain for provenance and are not active UI assets.

**Primary signature:** the actual wordmark lettering, never typeset with a substitute font. `on-ground-wordmark-cutout.webp` isolates the cream lettering from the original crop (156,225)–(1380,615), 1224 × 390. A color-difference alpha matte removes terracotta while retaining the photographed letter faces, shaded edge geometry and antialiasing. External wall shadows are omitted; the original relief photograph remains available. The cutout was inspected on both the sampled and deeper CSS surfaces; there is no opaque rectangular wall, visible fringe or stretched geometry.

**Secondary mark:** `on-ground-horse-original.jpg` is the unchanged new JPEG. Cream bounds from the sampling filter are (277,237)–(1250,1241); shadows extend beyond those bounds. The production seal uses crop (218,190)–(1318,1290), a 1100px square with room for the ears, ring and cast shadow. The relief has highlights on upper/left edges, warm darker bevels and downward/right wall shadows. Transparent extraction would flatten this dimensional character, so its natural wall is retained deliberately. The 440px WebP appears once per page as a 104px circular Footer seal, above the 232px wordmark with 24px spacing. It is decorative because the adjoining wordmark supplies the accessible brand name. No horse watermark, button icon or repeated section stamp is used.

**Header/mobile:** wordmark only (224px desktop, 188px small mobile), cream navigation, inverse cream Book CTA, tactile terracotta surface. The full name remains legible on mobile; a second mark would compete with navigation. Mobile menu uses the same signature/material and an airy warm neutral body. Footer composes the horse seal and smaller signature in one column rather than two equal logos side by side.

**Icons:** the official horse crop supplies a 16/32px RGBA favicon ICO, 64px `icon.png`, 180px `apple-icon.png`, and 512px app derivative. Next file conventions generate favicon/apple/icon metadata. At 16px the ring and horse silhouette carry recognition; relief detail is intentionally limited by scale. No invented SVG paths or generic horse symbol.

Textual business name remains **ON GROUND CAFE & FARM**. The location line is official artwork; internal ODIN identifiers remain unchanged.

## Canonical sampled palette

Both assets were sampled, not inferred from the prompt. Median background RGB from the upper 180px: wordmark (177,101,69), **#B16545**; horse (174,88,58), **#AE583A**. Horse background 10th–90th channel percentiles: (168,82,52)–(180,94,63). Cream filter: all channels >160 and max/min spread <90; horse median (244,227,202), **#F4E3CA**. The wordmark's previous cream sample (180,250)–(1350,440) is (240,220,194), #F0DCC2. These are photographic families, not client-specified flat inks. The horse establishes the single canonical terracotta/cream family; the original artwork's natural color differences remain within the asset rather than becoming extra site tokens.

| Token | HEX | Role |
| --- | --- | --- |
| `brand-accent` / `surface-terra` | #AE583A | Sampled mineral terracotta reference |
| `brand-terra-deep` | #96472D | Derived accessible material surface: Header/menu/Footer |
| `brand-primary` / `focus` | #87462F | Accessible actions, selected states, focus |
| `brand-primary-hover` | #703824 | Action hover |
| `brand-primary-active` | #592C1D | Action pressed |
| `brand-terra-soft` / `canvas-soft` / `surface-muted` | #F3E8DA | Quiet editor/section surface |
| `brand-cream` / `text-on-accent` / `text-on-dark` | #F4E3CA | Canonical cream; solid inverse text |
| `brand-cream-soft` / `canvas` / `surface` | #FCF8F2 | Main editorial canvas |
| `surface-dark` | #38261F | Deep earth editorial companion |
| `surface-deep` / `ink` / `text-primary` | #281B16 | Depth and primary text |
| `text-secondary` | #69564C | Ordinary metadata and pending copy |
| `border` | #9B8273 | Visible control boundary |
| `error` | #991B1B | Real validation/submission errors only |

## Tactile material and surface hierarchy

`.brand-terra-surface` is a reusable CSS treatment on Header, menu heading and Footer only. Base is the derived deep terracotta #96472D so small cream text is accessible. Two diffuse radial fields use 2.5% cream and 2.5% umber; a tiny inline SVG fractal grain (180px, frequency .68, three octaves, 2.5% opacity) provides stationary, nearly subconscious variation. This is procedural CSS/SVG material, not a repeating photograph. No external texture request, animation, large bitmap or obvious gradient stripe. Solid-color comparison was visually flatter; the understated material was retained after browser review.

Main content remains #FCF8F2; soft sections/editor #F3E8DA; Restaurant uses related earth #38261F. Avoid texturing every section. Artwork wall is used only inside the intentional small horse seal/icons. Cream Footer/nav copy is solid; no low-opacity small inverse text. Header hover is a quiet underline; 15px medium navigation has .015em tracking, reset for Thai/Chinese. Desktop navigation starts at 1280px.

Opening-hours and maximum-weight pills share cream/earth styling. Pending price uses solid secondary text on light backgrounds, cream on photos; ordinary restrictions never use error red. Booking progress, selected/duration choices, editor, estimate/pending copy, forms and CTA consume the same tokens. Booking handlers, domain rules, duration architecture, API and request semantics are preserved.

Contrast is measured using WCAG relative luminance including material's theoretical brightest composite, rather than assuming sampled cream/terracotta works for small text. Final measured values and keyboard/browser checks are recorded in BRAND_REFRESH_STATUS.md. Artwork is preserved as artwork. Controls retain 44px minimum targets and 2px contextual focus.

## Typography

Inter is the Latin/Cyrillic face; Noto Sans Thai and Noto Sans SC are the existing locale fallbacks. Display and body share this family.

- Hero: `clamp(3rem, 6.6vw, 6.4rem)`, 500 weight, 1.02 line height, -0.055em tracking; mobile `clamp(2.6rem, 10.6vw, 4rem)`, 11ch measure.
- Homepage H2 and Booking H1: `--type-heading: clamp(2rem, 4vw, 3.75rem)`, 500, -0.035em. Homepage line height 1.08; Booking 1.12.
- Booking H2: `--type-subheading: clamp(1.5rem, 2.3vw, 1.875rem)`, 500, 1.25, -0.025em.
- Homepage H3: 24–30px depending on composition, 500, 1.25, -0.025em. Restaurant H2 intentionally caps at 52px to fit its column.
- H4/form group headings: 16px semibold. Body: 16px; lead 18px; small 14px; metadata 12px. Homepage/Booking paragraphs use 1.7 line height.
- Eyebrow: .7rem, 600, .18em, uppercase. Navigation 15px; buttons 14px or 16px; labels 14px; input text 16px.
- Thai/Chinese headings remove negative tracking and use 1.25–1.45 line height; Booking headings use 1.4. Eyebrow tracking reduces to .04em.

## Grid and spacing

`Container` uses `.site-container` in the components cascade layer, so intentional utility overrides remain possible. `--page-width` is 1280px including gutters. Gutters are 20px below 640, 32px from 640, and 48px from 1024. Header, section headings, Gallery and Footer use this rail; Hero controls use its calculated `--page-rail`.

Booking uses the same 1280px outer rail. From 1024px it splits into a flexible editor and 280px itinerary; from 1280px the itinerary is 320px with an 80px gap. Restaurant intentionally extends to 1440px and uses a 3:2 image/copy grid from 1024px. These are deliberate compositions, not arbitrary section offsets.

`Section` uses `--section-space`: 72px mobile, 96px from 640, 112px from 1024. The hero, compact Restaurant and final photographic CTA retain contextual spacing. Internal spacing uses the existing 4px-based utility scale, typically 8/12/16/20/24/32/40/48/64px. Heading/content relationships remain contextual, not mechanically identical.

## Controls and surfaces

Shared Button variants: primary (accessible terracotta/cream), inverse (cream/accessible terracotta), secondary (umber/ivory), outline and ghost. Minimum heights 44/48/56px for sm/md/lg; 2px corners; wrapped labels supported; 150ms color transition. Disabled buttons retain the existing disabled behavior/opacity.

All active Booking text/date/number/select/textarea controls use `.form-control`: minimum 48px, 12px padding, 16px text, 1px semantic border, 2px radius, ivory fill. Hover darkens the border; focus uses terracotta; `aria-invalid` uses the error border; disabled controls fade. Existing labels, values and event handlers are unchanged.

Booking discovery and itinerary entries use square editorial rows and dividers; the active editor uses a warm tonal inset. Editorial photography is predominantly square-cornered. Pills remain only for compact metadata badges; circular gallery controls remain intentional. Fine tonal dividers provide structure; no decorative component shadows were added; material variation is limited to brand surfaces.

## Interaction, images and motion

Links retain contextual underline/border hover. Focus uses a 2px outline with offset; inverse photographic/umber surfaces use cream; text-bearing terracotta material uses cream focus. Forced-color mode uses system Highlight. Menu/language/icon controls target at least 44px. Mobile Footer navigation uses two columns with 44px links; larger layouts use 24px links plus vertical spacing.

Desktop Header navigation starts at 1280px; below it the branded Radix menu includes the language selector. Existing focus trap, Escape and close behavior stay intact.

Photographs retain existing aspect ratios/object positions: cinematic Hero, tall mobile Experiences, Restaurant 3:2 desktop composition, asymmetrical Gallery desktop grid and mobile swipe strip. No uniform card crop is imposed.

Existing 10-second slideshow cadence, reveal and parallax are preserved. CSS reduced-motion rules remove transforms/transitions and reveal hidden content; slideshow already suspends automatic advancement for reduced motion. No animation dependency added.

Breakpoints: existing xs 480, sm 640, md 768, lg 1024, xl 1280, 2xl 1536px. QA includes 1920px.

## Booking UX

The organizing concept is **Your visit**. Adding an experience creates the canonical item immediately, opens its editor and announces the addition through a polite status message. Discovery uses actual activity photographs, titles, existing descriptions/hours and a clear “Add to your visit” action. Already-added standalone experiences show a check, count, terracotta rule and “Edit in your visit”; “Add again” is a quiet explicit action. Activities included in a package carry an inclusion note without pretending a standalone item was added.

The itinerary retains numbered package/experience entries. One editor is open at a time; its terracotta rule and “Currently editing” label distinguish it from collapsed entries. Readiness comes from the existing visit validator. Collapsed entries expose date, time, guests and supplied weights. Edit, Duplicate and Remove use quiet 44px controls. Save details validates the item before collapsing it.

Desktop has a sticky “Your visit” summary at 112px from the viewport top, including package components, dates, times, guest counts and readiness. Below 1024px a native keyboard-accessible disclosure appears above the active stage, with count and pending-detail count visible while collapsed. No desktop sidebar is squeezed onto mobile.

“Add another experience” appears beneath the itinerary and in its summary, returning to discovery without dropping configured items. Packages retain their own heading and component list; additional activities appear as separate numbered entries in the same visit. Existing illustrative-package and restaurant notices remain visible.

Four restrained numbered progress labels identify Choose, Plan your visit, Your details and Review. The primary action progresses to details, review or submission; add-another is secondary; edit/duplicate/remove/back are tertiary. Review groups the visit by package/experience with dates, times, guests, weights, options, contact details and notes. Receipt remains **request received**, includes the returned reference and focuses its heading. No confirmation, payment or guaranteed-availability semantics are introduced.

The UI uses native buttons, labels and date/select controls; edit controls expose expanded state, validation errors retain their associations, and stage headings receive keyboard focus. New presentation adds no animation framework or independent motion effects.

## Duration and estimated-price presentation

Activity editing follows date/start time → duration → guests → rider weights. Approved duration tiers render as square editorial button choices, with minute label and locale-formatted THB price/unit, a terracotta selected rule and check, and `aria-pressed`. Package component choices say included rather than implying a standalone surcharge. Changing duration updates estimates and clears an invalid late start.

There are currently **no approved tiers**. Instead of fabricated buttons, each duration field shows “Duration to be agreed” and an explanation that the manager will agree duration and price. Item subtotals, desktop Your Visit, the collapsed mobile summary and Review show “Manager to confirm”. A mixed known/unknown visit never shows a partial sum as its total. Numeric tiers are exercised only by synthetic test fixtures.

`.visit-estimate` uses a divider, restrained label/amount and the visible final-price-manager notice. Currency uses next-intl number formatting; minute labels use localized messages. Review uses a two-column detail grid on small screens and four columns from 640px. No checkout/payment styling is introduced.

The single shared primary navigation is Experiences → Packages → Restaurant → Gallery → Location. Unavailable About/Contact/Privacy/Terms destinations are absent. Mock contacts, textual address and numeric mock prices are not rendered. The client-approved Maps URL is now the only published external location destination. Restaurant links to visit planning, with no table-reservation claim. Skip navigation is localized.

## Locale-control boundary follow-up

Default language selectors now use the semantic `border` token (#9B8273), replacing a 20%-opacity ink outline. Compositing the former alpha color against the actual pale menu surface measured 1.52:1; the solid semantic border measures 3.40:1. Header/Footer use solid cream boundaries on their deeper material surfaces. Locale values, routing and change handlers are unchanged.
