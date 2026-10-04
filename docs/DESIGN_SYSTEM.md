# ON GROUND design system

Implemented in `src/app/globals.css`, shared UI components and existing presentation components. This documents the current system, not a proposed framework.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `terracotta` / `brand-primary` | #84250F | Logo-derived primary brand, primary actions, selected step |
| `terracotta-dark` / `brand-primary-hover` | #6A1E0C | Primary hover/pressed |
| `terracotta-light` | #9D452B | Existing lighter accent |
| `cream-brand` / `brand-cream` | #F4D2A6 | Logo, dark-brand text, inverse action |
| `moss` | #253D32 | Editorial green surface and secondary actions |
| `moss-dark` | #192E25 | Green depth/hover |
| `canvas` / `surface` | #FAF8F2 | Main ivory canvas |
| `canvas-soft` / `surface-muted` | #EFECE3 | Tonal section and selection surface |
| `ink` / `text-primary` | #202C27 | Primary copy |
| `text-secondary` | #59635B | Solid muted copy, package disclaimers |
| `border` | #858D80 | Form-control boundary |
| `error` | #991B1B | Form errors |
| `saddle` | #77513D | Existing restriction badges |
| `dusk`, `dusk-light` | #CFAB79, #E5CDA9 | Retained supporting tokens |

Semantic aliases refer to the same original palette values rather than maintaining duplicate brand HEX declarations. Photography overlays intentionally retain transparency; this is not a rule to replace every contextual opacity with a solid color.

## Typography

Inter is the Latin/Cyrillic face; Noto Sans Thai and Noto Sans SC are the existing locale fallbacks. Display and body share this family.

- Hero: `clamp(3rem, 6.6vw, 6.4rem)`, 500 weight, 1.02 line height, -0.055em tracking; mobile `clamp(2.6rem, 10.6vw, 4rem)`, 11ch measure.
- Homepage H2 and Booking H1: `--type-heading: clamp(2rem, 4vw, 3.75rem)`, 500, -0.035em. Homepage line height 1.08; Booking 1.12.
- Booking H2: `--type-subheading: clamp(1.5rem, 2.3vw, 1.875rem)`, 500, 1.25, -0.025em.
- Homepage H3: 24–30px depending on composition, 500, 1.25, -0.025em. Restaurant H2 intentionally caps at 52px to fit its column.
- H4/form group headings: 16px semibold. Body: 16px; lead 18px; small 14px; metadata 12px. Homepage/Booking paragraphs use 1.7 line height.
- Eyebrow: .7rem, 600, .18em, uppercase. Navigation 13px; buttons 14px or 16px; labels 14px; input text 16px.
- Thai/Chinese headings remove negative tracking and use 1.25–1.45 line height; Booking headings use 1.4. Eyebrow tracking reduces to .04em.

## Grid and spacing

`Container` uses `.site-container` in the components cascade layer, so intentional utility overrides remain possible. `--page-width` is 1280px including gutters. Gutters are 20px below 640, 32px from 640, and 48px from 1024. Header, section headings, Gallery and Footer use this rail; Hero controls use its calculated `--page-rail`.

Booking uses the same 1280px outer rail. From 1024px it splits into a flexible editor and 280px itinerary; from 1280px the itinerary is 320px with an 80px gap. Restaurant intentionally extends to 1440px and uses a 3:2 image/copy grid from 1024px. These are deliberate compositions, not arbitrary section offsets.

`Section` uses `--section-space`: 72px mobile, 96px from 640, 112px from 1024. The hero, compact Restaurant and final photographic CTA retain contextual spacing. Internal spacing uses the existing 4px-based utility scale, typically 8/12/16/20/24/32/40/48/64px. Heading/content relationships remain contextual, not mechanically identical.

## Controls and surfaces

Shared Button variants: primary (terracotta/white), inverse (cream/terracotta), secondary (green/ivory), outline and ghost. Minimum heights 44/48/56px for sm/md/lg; 2px corners; wrapped labels supported; 150ms color transition. Disabled buttons retain the existing disabled behavior/opacity.

All active Booking text/date/number/select/textarea controls use `.form-control`: minimum 48px, 12px padding, 16px text, 1px semantic border, 2px radius, ivory fill. Hover darkens the border; focus uses terracotta; `aria-invalid` uses the error border; disabled controls fade. Existing labels, values and event handlers are unchanged.

Booking discovery and itinerary entries use square editorial rows and dividers; the active editor uses a warm tonal inset. Editorial photography is predominantly square-cornered. Pills remain only for compact metadata badges; circular gallery controls remain intentional. Fine tonal dividers provide structure; no new shadows or gradient decoration were added.

## Interaction, images and motion

Links retain contextual underline/border hover. Focus uses a 2px outline with offset; inverse photographic/green surfaces and brand surfaces use cream. Forced-color mode uses system Highlight. Menu/language/icon controls target at least 44px. Mobile Footer navigation uses two columns with 44px links; larger layouts use 24px links plus vertical spacing.

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

The single shared primary navigation is Experiences → Packages → Restaurant → Gallery → Location. Unavailable About/Contact/Privacy/Terms destinations are absent. Mock contact/address/map destinations and numeric mock prices are not rendered. Restaurant links to visit planning, with no table-reservation claim. Skip navigation is localized.
