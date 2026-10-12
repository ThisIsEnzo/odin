# PR #4 main integration

Safety branch: `backup/booking-pricing-pre-conflict-c2a8` points exactly to `c2a8b6361802983c05e167fe1480b1bc4a5aa267`. It is local only. The completed commit was never reset, amended, rebased or squashed.

Verified remote booking baseline: `c999596458478013baced01f014641a26bd61433`.
Verified main: `43c0fe8cf1edcd8bcb3513fdde55ab3eb47e2dd3`.
Main tree: `08d794735d689cd479a34923f82b950d6ab5b79d`.

That main tree is **identical** to tree of `9729ac0d52357b0ec3da49aa64bb046eb273e14d`, an existing ancestor of the booking branch. Main contains the same brand content through a different history; it introduces no file content beyond the already-integrated brand commit. Later booking and UI refinements remain necessary and approved. Every unresolved incoming file was checked against that ancestor before resolution. No blind whole-branch ours/theirs strategy was used.

The standard `git merge --no-commit --no-ff origin/main` could not complete because the GitHub connector is UTF-8-only and some unchanged binary blob objects cannot be materialized. Required main/base text blobs, trees and exact commit objects were recovered from GitHub and hash-verified. A three-way index was built with `git read-tree -i -m <merge-base> HEAD origin/main`, then resolved manually. Before this report was added, the resolved tree was exactly the completed tree `7470b4594b748b3d3ad054af936819f23946b78b`. This verifies preservation of all 33 completed files and all existing asset IDs.

## Paths resolved in the three-way index

- `docs/DESIGN_SYSTEM.md`, `docs/UI_UX_AUDIT.md`: keep integrated brand guidance plus later UI/release findings.
- `messages/en.json`, `ru.json`, `th.json`, `zh.json`: keep every main locale key and later V3/package/pricing copy; Open daily wording retained.
- `src/app/globals.css`: preserve terracotta/cream tokens, tactile surface, alpha-following logo shadows, calm navigation, language-control focus behavior, directional-reveal fix and V3/package styles.
- `src/app/apple-icon.png`, `favicon.ico`, `icon.png`: retain exact later transparent horse derivatives from the completed booking tree. Older `src/app/icon.svg` remains deleted.
- `src/components/domain/booking/BookingFlow.tsx`, `OfferFacts.tsx`, `__tests__/BookingFlow.test.tsx`: preserve real V3 package selection, Review/Edit/submission and tests instead of restoring the V2 wizard.
- Deleted V2-only components remain deleted: `ActivityEditor.tsx`, `BookingOptions.tsx`, `BookingStepper.tsx`, `DurationSelector.tsx`, `Estimate.tsx`, `ExperiencePicker.tsx`, `VisitSummary.tsx`, `VisitItemEditor.tsx`, `__tests__/DurationSelector.test.tsx`, and `steps/{Customer,Experience,Guests,Review,Schedule}Step.tsx`.
- `src/components/homepage/{Packages,Restaurant,ReviewsLocation,WhyOdin}.tsx`: preserve canonical package links, Open daily copy, existing map/location refinements and mobile grid/reveal fixes.
- `src/components/layout/{BrandLogo,BrandSeal,Footer,Header,LanguageSwitcher,MobileNav}.tsx`: preserve the already-integrated main brand and later transparent artwork, stable header, premium navigation and language-control refinements.

Total: **37 unresolved index paths**, all resolved individually, plus the auto-added legacy `VisitItemEditor.tsx` explicitly removed because its V2 functionality was already superseded/deleted on the booking branch. This index list includes modify/delete and add/add paths that a full-object merge could otherwise auto-resolve.

## Migration and pricing preservation

Migrations 0000, 0001, 0002 and 0003, journal entries and schema remain identical to the completed commit. No migration renumbering or historical rewrite. Horse/Pony tiers, occupancy ATV prices, pending Sauna billing, exact package compositions and quantities, EXCLUSIVE default discounts, server calculation, frozen snapshots, idempotent replay and transport-only provider code all remain intact. See [PACKAGE_PRICING_STATUS.md](PACKAGE_PRICING_STATUS.md).

The final merge has first parent `c2a8b636...` and second parent latest main `43c0fe8...`; the original completed commit remains in its ancestry. No force push, rebase, backup-branch upload or PR merge is authorized/performed.
