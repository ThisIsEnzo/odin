# ON GROUND — UX/UI Redesign ("Editorial Estate")

Base: main @ fa793736da9f2340c1d05591d0670da9b8fdc308. Branch: feature/odin-complete-ux-ui-redesign.

## Audit (grounded in source)
- Errors styled in brand terracotta, not red (request-input[aria-invalid],
  request-field-error, request-errors) — users can't tell invalid from selected.
- No display type voice: Inter used for everything incl. --font-display.
- Desktop nav only at xl (1280px); 1024–1279 laptops got a hamburger.
- ExperienceShowcase desktop "tablist" was a div with aria-label="Book this
  experience" + aria-pressed (invalid semantics, no keyboard model).
- Reveal SSR'd opacity:0 → content invisible without JS.
- GalleryLightbox swipe tracked dragOffset but never rendered it (dead gesture).
- Hero.tsx dead code linking to non-existent /experiences.
- ~160 lines of unused V2 CSS (.visit-*, .discovery-*, .duration-choices,
  .form-control, .package-activity-*).
- 3–4MB photographic JPEGs (hero/experiences/gallery) dominate payload.
- Badge moss/saddle/dusk were identical.
Measured contrast ratios (sRGB): cream #f4e3ca on deep terracotta #96472d = 5.16:1; brand primary #87462f on canvas #fcf8f2 = 6.73:1; error #991b1b on canvas = 7.85:1; secondary text #69564c on canvas = 6.54:1; interactive border #856c5e on canvas = 4.61:1. The mobile-menu brand panel uses the same deep terracotta as the header so its cream lettering also meets AA.

## Direction
Elevate the approved warm earth/terracotta/cream identity (do NOT re-hue or
redraw the official logo). Add a Cormorant Garamond display voice (Latin +
Cyrillic) over Inter UI; Noto Sans Thai/SC remain in the fallback stack for
th/zh. Generous editorial rhythm, hairline rules, numbered sections, warm
low shadows, restrained purposeful motion.

## Design system
Tokens centralized in globals.css @theme: brand/surface, --color-border
(interactive 4.5:1) vs --color-hairline (decorative), --color-error +
--color-error-surface, type scale (--type-hero/heading/subheading/title),
radii, --shadow-sm/md/lg, --ease-out/in-out. Display serif applied to hero,
homepage h2, booking h1/h2, section/package headings; functional card h3 and
UI stay sans.

## Implementation
globals.css rewritten (dead V2 CSS removed, all live selectors preserved);
layout.tsx adds Cormorant_Garamond; Reveal progressive enhancement;
ExperienceShowcase real tabs + keyboard; Header nav at lg + compact scroll;
MobileNav breakpoints xl→lg; GalleryLightbox live swipe; Button/Badge/Card
polish; Hero.tsx deleted; scripts/optimize-images.mjs added.

## Preserved (hard constraints)
Official logo byte-for-byte; maps embed; request-to-book wording (never
"confirmed"); mock contacts/prices suppressed; empty reviews stay empty;
i18n EN/TH/RU/ZH; all APIs, persistence, booking business logic unchanged.

## Responsive
Responsive targets defined in CSS: 360/390 (mobile), 640, 768, 1024 (desktop nav appears), 1280, 1440. Booking grids switch from 1→2 columns at 640/1024; restaurant/location grids at 1024; hero typography clamps. These are implementation targets, not a claim of completed browser verification.

## Accessibility
Real error colors + aria-invalid; tablist/tab/tabpanel + roving tabindex +
arrow keys; visible focus rings; reduced-motion respected (global + Reveal +
lightbox); forced-colors fallbacks; 44–48px targets; skip link retained.

## Testing status (honest)
The supplied implementation note reports delimiter-balance and CSS-class-coverage checks; they have not been independently reproduced during this GitHub-only PR preparation. NOT yet run here: npm run typecheck, lint, vitest, next build, or browser visual QA. Run them before merge.

## Remaining
- Run full typecheck/lint/test/build + browser QA at 360/390/768/1024/1280/1440.
- Execute image optimization and commit smaller assets.
- Optional: self-host fonts via next/font/local for offline builds.
