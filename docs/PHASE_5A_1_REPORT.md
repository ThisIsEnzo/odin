# ODIN Phase 5A.1 — Visual redesign

Final continuation status and verified scope: see [PHASE_5A_1_STATUS.md](PHASE_5A_1_STATUS.md).

## Status
Frontend implementation delivered. Production readiness is NOT claimed: original booking TypeScript errors and ESLint configuration errors remain outside this visual phase.

## 1. Visual audit
- A large frosted panel obscured the hero photography.
- Lora headings, small section titles and uniform beige surfaces weakened hierarchy.
- Repeated rounded cards and package pricing tiles felt generic.
- Missing image files and invalid logo references prevented a complete presentation.
- Hero had only one source; existing controls had no useful role.
- Gallery alternative text did not match the supplied photographs.

## 2. Design direction
Sans-led editorial typography using existing Inter and Noto multilingual families; warm ivory, deep green and restrained terracotta; large photographic surfaces; open numbered layouts; fine dividers; restrained existing reveal motion. Lora was removed from loading. No new app dependencies.

## 3. Asset mapping
Files are copied from the user-supplied images.zip without image generation or altered branding.

| Input | Project destination / use |
|---|---|
| hero/odin-hero.jpg | public/images/hero/odin-hero.jpg — first slide, horse and stable |
| hero/odin-hero-2.jpg | same relative folder — second slide, countryside; final CTA |
| hero/odin-hero-3.jpg | same relative folder — third slide, restaurant terrace |
| experiences/odin-horse.jpg | same relative folder under public/images — Horse Riding |
| experiences/odin-pony.jpg | same relative folder under public/images — Pony Riding |
| experiences/odin-atv.jpg | same relative folder under public/images — ATV |
| experiences/odin-sauna.jpg | same relative folder under public/images — Sauna |
| restaurant/odin-restaurant.jpg | same relative folder under public/images — Restaurant |
| gallery/odin-gallery-01.jpg | same relative folder — paths and paddocks |
| gallery/odin-gallery-02.jpg | same relative folder — grazing horses |
| gallery/odin-gallery-03.jpg | same relative folder — leather saddle |
| gallery/odin-gallery-04.jpg | same relative folder — evening countryside |
| gallery/odin-gallery-05.jpg | same relative folder — visitors beside paddock |
| odin-logo(2).jpg | public/images/brand/odin-logo.jpg — full original logo in header, menu and footer |

The two supplied placeholder SVGs are retained for existing canonical fallback paths; the homepage gallery uses the JPGs. Supplied imagery is not independently verified as documentary ODIN photography; the master handoff identifies earlier images as concept assets.

## 4. Files changed
- `src/components/ui/Button.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/motion/Reveal.tsx`
- `src/components/homepage/Faq.tsx`
- `src/components/homepage/HeroSlideshow.tsx`
- `src/components/homepage/Restaurant.tsx`
- `src/components/homepage/WhyOdin.tsx`
- `src/components/homepage/Gallery.tsx`
- `src/components/homepage/ExperienceShowcase.tsx`
- `src/components/homepage/FinalCta.tsx`
- `src/components/homepage/Packages.tsx`
- `src/components/homepage/ReviewsLocation.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/layout.tsx`
- `src/app/globals.css`
- `messages/ru.json`
- `messages/en.json`
- `messages/th.json`
- `messages/zh.json`

Added: supplied files under `public/images/`, this report and `docs/PHASE_5A_1_STATUS.md`. Review-only screenshots and scripts are excluded from the deliverable.

## 5. Major visual changes
- Header: full supplied logo, compact scrolled state, readable ivory surface, mobile booking CTA, fullscreen-style mobile navigation.
- Hero: open headline and shortened localized copy; three distinct supplied slides; numbered controls, arrows and pause; corrected experience anchor.
- Experiences: open numbered desktop index, large image; vertical expanding mobile panels; inactive panels are inert so hidden CTAs cannot receive focus.
- Why ODIN: numbered text and dividers instead of decorative feature cards.
- Packages: full-width editorial rows; original mock notices, prices and package URL context retained.
- Restaurant: full-width photograph and overlapping dark-green editorial block.
- Gallery: asymmetric six-column grid and mobile snap strip; lightbox retained; corrected multilingual alt descriptions.
- Reviews/location: honest empty reviews state, lighter dividers, original Maps destination logic retained.
- FAQ: clean dividers and spacing; fixed missing distance interpolation using canonical siteConfig.
- Final CTA: photographic closing scene, original booking action and corrected experience anchor.
- Shared buttons: terracotta primary, green secondary, visible focus and minimum touch height.

## 6. Responsive changes
Desktop navigation switches to the mobile menu below 1280px to accommodate long labels. Footer uses two columns on tablets and four on larger screens. Mobile experiences remain a vertical accordion, not a carousel. Hero uses fluid type and content-driven height; Thai/Chinese headings preserve normal tracking and larger line-height. Font fallback families remain configured.

## 7. Verification
- npm ci: failed because the supplied lockfile recorded Vitest 4 while package.json requests Vitest 2.
- npm install --ignore-scripts: succeeded, 480 packages. package.json unchanged. The generated lockfile changed 114 package records and was restored to the original baseline in the final continuation, because the visual phase does not require dependency changes.
- npm test: PASSED, 39 tests across two files. Existing component tests are not included by the original Vitest configuration; they are not claimed as executed.
- Translation parity script: PASSED, 179 keys in en/ru/th/zh. Existing keys retained; added localized slideshow pause/play labels.
- Image path audit: PASSED, no missing literal /images references in src.
- Byte comparison with original ZIP: booking API, repository, notification, rules, schema, types, domain booking UI and canonical business data unchanged.
- npm run typecheck: FAILED on existing booking/test errors; the same errors reproduced in an untouched baseline with identical dependencies. Gallery/Reveal indexed-access errors in the baseline were fixed in the touched frontend. No errors reported in redesigned frontend files.
- npm run lint: FAILED due to circular configuration serialization; reproduced in untouched baseline.
- npm run build: compiled successfully, then FAILED at existing TypeScript errors. No ignoreBuildErrors or disabled validation added.
- Browser verification details: see PHASE_5A_1_STATUS.md.

## 8. Remaining issues
- Production build blocked by existing booking/test type errors (Zod issue path types, strict indexed access, test matcher declarations).
- Existing ESLint configuration fails before linting.
- Google Fonts requests fail in this environment's dev server; browser screenshots use fallbacks where loading failed. Native Thai/Chinese glyph quality needs review with the intended fonts available.
- Existing /about, /contact, /privacy and /terms routes remain unimplemented.
- Existing mock location/contact, package and restaurant data need business confirmation before launch; no facts were invented or changed.
- Production backend remains in-memory/console as requested.

## Run locally
Use Node >=20.9, run npm install, then npm run dev (npm ci remains blocked by the original lockfile mismatch). Production deployment still requires the separately listed baseline fixes. Do not proceed to backend architecture as part of this phase.
