# Official brand refresh status

## Delivery and recovered base

- Repository: ThisIsEnzo/odin; base main `0f9eb3ded5fd653bf20f5b68d56098a45e8a0e0f`.
- Branch: `brand/on-ground-khao-mai-kaeo-refresh`, starts directly at that main commit. PR #2 is merged and untouched. No merging or deployment performed.
- Original checkout was absent. GitHub app retrieved source from the exact main SHA. All 173 file blobs, the root tree `1888b3e8a187eb8d4f04cacb6cad5665b4ed5d04` and base commit object were verified/recovered exactly. Large unchanged photographs were recovered from local photo copies only after their Git blob hashes matched the authoritative GitHub tree. No archive source code was used.
- Direct Git authentication is unavailable; publication uses connected GitHub Git-object/ref operations, preserving the exact base parent and brand-only delta.

## Artwork and palette

Source: newly uploaded `1000070899.jpg`, visually “on ground · KHAO MAI KAEO”; the older `odin-logo(2).jpg` is not the new authority. Untouched new original, 1224 × 390 full wordmark WebP crop and 64/180px source-lettering icons are production assets. No cutout, redrawing, generated lettering or stretched geometry. Original texture/shadows are retained deliberately.

Sampled terracotta #B16545 and cream #F0DCC2. Derived action #87462F, hover #703824, active #592C1D, canvas #FCF8F2, muted surface #F3E8DA, umber #38261F, depth/body #281B16, on-terracotta text #090604, secondary #69564C, border #9B8273. Functional error #991B1B. See DESIGN_SYSTEM.md for sampling rectangles, filters and semantic mapping.

Textual **ON GROUND CAFE & FARM** is preserved: the artwork's location line does not independently confirm a business-name change. Technical identifiers, environment names, migrations and ODIN reference prefix remain intact.

## Presentation and preserved behavior

- Header: proportional 224px wordmark (188px small mobile), sampled terracotta, readable dark nav/language/menu controls and umber CTA; existing sticky/scrolled behavior retained.
- Mobile menu: full wordmark in matching heading, pale body, clear close/language controls and primary CTA. Existing Radix focus/close behavior retained.
- Footer: dark umber with deliberate source artwork plaque; mock-contact and unavailable-link rules remain unchanged.
- Homepage: existing hero, editorial Experiences, Packages, compact Restaurant, Gallery, Location, FAQ and Final CTA compositions retained. Warm neutral surfaces and controlled terracotta/umber replace green visual legacy. Existing fonts and photographs unchanged.
- Booking: Your Visit, active editor, sticky desktop/mobile summaries, add/edit/duplicate/remove, package plus extras, progress, review and receipt retained; presentation consumes new semantic colors. No approved duration tiers were supplied. Duration-to-be-agreed and Manager-to-confirm behavior remains; no prices invented.
- Shared navigation is byte-identical: Experiences → Packages → Restaurant → Gallery → Location.
- Old logo files have no active production references. Historical originals/derivatives remain where cited by earlier documentation. Old active icon.svg removed; Next icon metadata now serves icon.png and apple-icon.png. No existing OpenGraph/structured organization logo was present.

## Verification

- `npm test`: 153 passed across 9 files; baseline coverage retained. Includes duration validation, closing boundaries, estimates, package double-count protection, snapshots and UI behavior.
- `npm run typecheck`: passed.
- `npm run build`: passed, including four locale homepages and new icon routes.
- `python scripts/check_i18n_parity.py`: passed; 271 matching EN/RU/TH/ZH keys. No locale messages changed.
- `git diff --check`: passed.
- `npm run lint`: attempted; inherited FlatCompat/config-validator circular JSON serialization failure persists. Not claimed passing; ESLint configuration untouched.
- Production Chromium: 283 matrix checks across 375/390/430/768/1024/1280/1440/1920px and RU/TH/ZH 390px; zero page errors/horizontal overflow. Header logo loaded at 2× density, sticky state, navigation/menu order, footer, booking editor/pending duration/pricing, contact details, Review and mocked Request Received. Mobile locale home/menu/editor and raw-key checks passed. Screenshots visually inspected for desktop/mobile Booking, mobile menu and Thai editor.
- Additional 21 browser checks passed: Restaurant and repeated same-hash anchors, FAQ, Gallery open/Escape, image loading, language selection, duplicate/remove/edit, two activities, one active editor, package plus extra, pending total, absent mock/dead destinations, icon metadata and mobile summary expansion.
- Receipt API was intercepted in browser QA. No actual request, DB migration or provider message was sent.
- Measured key color pairs: header text/terracotta 4.63:1; cream/action 5.33:1; cream/footer 10.73:1; secondary/canvas 6.54:1; action/editor 5.89:1; boundary/canvas 3.40:1. Focus remains 2px with offset and contextual dark/cream contrast. Disabled states retain native disabled semantics. Logo artwork fidelity was preserved. This is targeted QA, not full WCAG certification.

## Backend freeze and remaining items

`src/lib`, `src/data`, `src/types`, APIs, database schema, Drizzle migrations, outbox, LINE/WhatsApp, idempotency, domain rules and translations are byte-identical to base. No backend change or migration required.

Remaining existing release inputs: approved activity duration/price tiers/billing basis; confirmed packages, contacts/directions/legal content; live database/provider setup. Separate inherited ESLint configuration repair remains outside this task. A flat vector/transparent official logo could improve future small-size rendering; it is not supplied or fabricated here.

## Files changed

- `docs/DESIGN_SYSTEM.md`
- `docs/UI_UX_AUDIT.md`
- `public/images/brand/on-ground-khao-mai-kaeo-original.jpg`
- `public/images/brand/on-ground-khao-mai-kaeo-wordmark.webp`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/apple-icon.png`
- `src/app/globals.css`
- `src/app/icon.png`
- `src/app/icon.svg`
- `src/components/domain/booking/ActivityEditor.tsx`
- `src/components/domain/booking/BookingFlow.tsx`
- `src/components/domain/booking/BookingStepper.tsx`
- `src/components/domain/booking/ExperiencePicker.tsx`
- `src/components/domain/booking/RequestReceived.tsx`
- `src/components/domain/booking/VisitSummary.tsx`
- `src/components/domain/booking/steps/CustomerStep.tsx`
- `src/components/domain/booking/steps/ExperienceStep.tsx`
- `src/components/domain/booking/steps/GuestsStep.tsx`
- `src/components/domain/booking/steps/ReviewStep.tsx`
- `src/components/domain/booking/steps/ScheduleStep.tsx`
- `src/components/homepage/ExperienceShowcase.tsx`
- `src/components/homepage/Faq.tsx`
- `src/components/homepage/FinalCta.tsx`
- `src/components/homepage/Gallery.tsx`
- `src/components/homepage/Packages.tsx`
- `src/components/homepage/Restaurant.tsx`
- `src/components/homepage/ReviewsLocation.tsx`
- `src/components/homepage/WhyOdin.tsx`
- `src/components/layout/BrandLogo.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/LanguageSwitcher.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Section.tsx`
- `docs/BRAND_REFRESH_STATUS.md`
