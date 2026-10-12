# Official logo integration

Visual-only follow-up to `817763cfd0a7c53b9fd41aac4b0d23cd8e00194e` on
`booking/simplified-request-flow`. No booking, pricing, promotion, API, database,
notification or navigation behavior changes.

## Assets and surfaces

- The two supplied photographs remain the artwork source. No lettering or horse
  geometry is redrawn, traced with a substitute font, or generated.
- `on-ground-wordmark-relief.svg` and `on-ground-horse-relief.svg` retain those
  photographs and extend the repository's existing SVG chroma-relief method.
  A color-derived alpha removes the terracotta wall; a restrained edge/offset
  retains a narrow photographic bevel. The original cream color variation stays.
- The production assets are lossless transparent WebP exports of these SVGs:
  wordmark 1206 x 375 (117,128 bytes), horse 1011 x 1048 (201,460 bytes).
  They comfortably exceed the displayed 188/212/232px wordmark and 88px horse
  dimensions at 2x/3x pixel density. Their corner alpha is zero. SVG sources are
  retained for reproduction; the page does not execute their extraction filters.
- Warm, short CSS drop shadows follow the alpha rather than a rectangular box.
  They recreate the reference's lower-right shadow without a black glow.
- Header/menu material base is `#b96746`; the existing reusable procedural SVG
  plaster and restrained lighting gradients are retained, with grain alpha 0.09.
  No wall photograph is stretched or tiled behind the header. The dark earth
  footer base and footer grid are unchanged.
- Header dimensions, logo widths, navigation order, CTA, language selector and
  mobile menu behavior are preserved. The horse no longer has a circular wall
  crop, overflow clipping or a geometry-distorting 140% image transform.

## Verification

- `npm test`: 252 tests passing in 13 files.
- `npm run typecheck`: passed.
- `npm run build`: passed, including all four localized homepages.
- `git diff --check`: passed.
- Chromium at device scale factor 2: 375, 390, 430, 768, 1024, 1280 and 1440px.
  All four locales checked for page/menu overflow and header/footer bounding
  boxes, including the scrolled header and opening/closing the mobile menu.
  No horizontal overflow or off-screen brand/navigation boxes was found.
  `/en/book` also checked at 390px without submitting a request.
- Header/footer screenshots reviewed against both supplied references. The
  production WebP versions additionally checked across the seven EN widths.
  No source-wall rectangle, visible cream halo or distorted aspect ratio.

## Environment limits

Authenticated command-line clone/push was unavailable. Source text and exact
Git objects were recovered through the connected GitHub API and verified by
blob/commit hashes. The latest 15 remote commit entries were inspected; 11 exact
commit objects were recoverable locally, with a shallow boundary there.
Unchanged binary repository assets could not be downloaded by the text-only
connector; they remain in the original remote tree. The supplied logo files
were available locally and are fully represented in the new assets.

Visual QA therefore covers the actual header, footer, menus and layout geometry,
but is not a full photography review: unrelated homepage photos were missing
in the local preview. Safari/Firefox and physical-device rendering were not
tested. Photographic bevel extraction is an approximation at the edge, while
letter/horse geometry and cream surface come from the official artwork.

Delivery uses a fast-forward GitHub API ref update against the verified parent,
preserving every unrelated tree entry. No merge or rebase is performed.
