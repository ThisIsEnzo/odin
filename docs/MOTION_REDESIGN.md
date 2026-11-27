# ON GROUND — "The Slow Country" cinematic motion redesign

Base: main @ c8f0b701603ab971c98a5e0eab35d559734a4b8c. Branch: feature/odin-cinematic-motion.

## Creative direction
A continuous scroll film: Arrival → land → experience → table → moments → find us → invitation.
The approved earth/terracotta/cream identity, official logo, Cormorant Garamond display and Inter UI remain unchanged. The new layer adds restrained cinematic motion and depth.

## Motion system
No animation dependency added. A shared scroll engine in src/lib/motion.ts uses one passive scroll/resize listener and one requestAnimationFrame loop, batching geometry reads before style writes. Primitives: Parallax, Reveal (+ mask), SplitText, ScrollScene and useReducedMotion.

## Signature moments
- Hero: staggered word-rise headline, location chip, drifting/zooming media and scroll cue.
- Experiences: desktop parallax depth and gentle image zoom; existing accessible tabs remain.
- Restaurant: masked photo wipe and parallax.
- Gallery: masked photographic reveals.
- Finale: pinned ScrollScene with scroll-linked photography scale.
- Navigation: underline draw on hover/focus.

## Responsive and accessibility
Parallax is disabled below 768px with static frames. Reduced-motion keeps content readable and removes scroll-linked movement. Content remains visible without JavaScript. SplitText retains ordered text. Existing focus states, routing and booking interactions are preserved.

## Preserved
Routing, EN/TH/RU/ZH translations, booking request flow, validation, pricing/promotions, map embed, request-to-book semantics and official assets. No new business claims or data.

## Testing status
Only the supplied static delimiter/JSX, CSS-class and import-resolution checks are reported as passed; they were not independently rerun through GitHub. Typecheck, lint, Vitest, Next build and browser QA were not executed. Run all before merge.

## Remaining
- Run typecheck, lint, tests and production build.
- Browser QA at 360/390/768/1024/1280/1440 in EN/RU/TH/ZH, including reduced-motion.
- Run scripts/optimize-images.mjs after installing sharp and review pinned finale behavior on small phones.
