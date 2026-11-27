# ON GROUND — Screenshot-driven UX/UI audit

## Scope and evidence

This audit records the desktop/mobile visual findings supplied in the screenshot-review handoff and checks the implementation details against the merged `main` source. The screenshot files themselves were not available to this GitHub-only implementation session, so this document does not claim a fresh visual/browser inspection.

## Findings, prioritized

### Critical — content can remain hidden

The current `Reveal` component arms its hidden CSS state after mount, then relies exclusively on `IntersectionObserver` to add `reveal-visible`. There is no fallback if an element never intersects (for example, a no-scroll full-page capture) or if observer setup fails. This can leave any wrapped section at `opacity: 0` indefinitely.

**Important source correction:** `RevealVariant` already includes `"mask"`, and `.reveal.reveal-mask` plus its visible/reduced-motion CSS already exist in `globals.css`. The defect is the missing visibility fallback, not a missing variant type or missing mask selector.

The supplied screenshot review also reports blank hero and final-invitation photography. Those image elements are not wrapped in `Reveal` in the current source, so their blank appearance cannot be attributed to the observer-only reveal bug. The implementation adds dependable surface colors behind image elements; actual image loading/rendering still needs browser/network verification.

### Major — chapter numbers dominate their headings

The shared `.chapter-index` style uses a display font at `clamp(3.5rem, 9vw, 7rem)` with low opacity. The screenshot review reports that 01–04 read as oversized ghost numerals rather than useful editorial navigation.

**Fix:** use a small folio marker: compact sans-serif number, restrained tracking and a short rule. Preserve the existing chapter titles and copy.

### Major — VisitBrief desktop facts lack presence

The current facts use a 1.05rem value size and three equal columns inside the right-hand portion of the desktop band. The supplied screenshot review reports that these facts feel too small beside the large left-side title.

**Fix:** increase the values responsively and use a stacked title/facts arrangement at tablet widths, where three narrow columns would otherwise wrap awkwardly.

### Supporting — photographic surfaces need a fallback

Story, restaurant, gallery and map surfaces should remain intentionally composed while images/maps load or fail.

**Fix:** apply the existing warm canvas/deep-surface tokens behind those media regions and retain minimum image-frame heights where a grid cell would otherwise collapse.

## Mobile observations from the screenshot handoff

The supplied review describes the mobile experience as generally strong: the experiences accordion and package ledger remain readable, the booking form is clear, and the persistent Book bar appears to clear the footer. These are retained rather than redesigned without evidence.

No new mobile navigation or booking behavior is introduced in this pass.

## Implementation

- `src/components/motion/Reveal.tsx`: immediate reveal for elements already near the viewport, IntersectionObserver for normal scroll entry, and a 900ms safety fallback. Missing/throwing observer implementations reveal content instead of leaving it hidden. Cleanup disconnects the observer and clears the timer.
- `src/app/globals.css`: warm image/map fallback surfaces, compact folio markers for 01–04, and stronger VisitBrief values with a tablet-specific layout.
- No booking, pricing, persistence, notification or business-data behavior is changed.
- No translation keys or new visible business claims are introduced.

## Verification status

Source-level checks can confirm that the fallback path and styles exist, but they cannot prove the screenshot appearance. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, browser QA, image-network inspection and new screenshots have **not** been run in this implementation session.

Before merge, validate at 360 / 390 / 768 / 1024 / 1280 / 1440px in EN / TH / RU / ZH. Confirm that no Reveal-wrapped content remains hidden without scrolling, that image assets load independently of Reveal, that the folio markers no longer overpower headings, and that VisitBrief values wrap cleanly.

## Remaining photography work

The Farm Journal photography gaps remain: family/pony, horse detail, ATV motion, sauna atmosphere, table/food, grounds and arrival signage. Do not substitute generic stock images or describe placeholder art as real activity photography.
