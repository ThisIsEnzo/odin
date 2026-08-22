import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { galleryItems } from "@/data/odin/gallery";

/**
 * Verified against docs/odin_phase3_reconcile_reference.md: `gallery` is the
 * correct named export from src/data/odin/gallery.ts (aliased to
 * `galleryItems` below), and every field used (id, altTranslationKey) matches
 * GalleryItem in src/types/domain.ts.
 *
 * PHASE 3D: `src/data/odin/gallery.ts` itself is untouched (data-layer edits
 * are out of scope per the PHASE 3D brief §9) — every real item in it still
 * points at the same shared placeholder SVG. The five new photos are
 * resolved here instead, by array position, purely as a presentation-layer
 * override; `item.src` (the placeholder) is the fallback for any item this
 * map doesn't cover. `item.width`/`height` (placeholder dimensions) are no
 * longer used for sizing — every image below is rendered with `fill` inside
 * a CSS-sized container instead, since the brief explicitly says not to
 * depend on the source JPGs' original aspect ratios.
 */
const galleryImageOverrides: string[] = [
  "/images/gallery/odin-gallery-01.jpg",
  "/images/gallery/odin-gallery-02.jpg",
  "/images/gallery/odin-gallery-03.jpg",
  "/images/gallery/odin-gallery-04.jpg",
  "/images/gallery/odin-gallery-05.jpg",
];

const galleryImageFocus: string[] = ["45% 40%", "center 60%", "center 45%", "center 45%", "35% 55%"];

/**
 * PHASE 3C: mobile gets a horizontal snap-scroll carousel (all items, one
 * scroll axis, no parallax — §6/§9 say reduce motion complexity on mobile).
 * sm+ gets the earlier editorial grid, now with a restrained parallax +
 * hover-scale on just the featured image (one of the page's 2–3 parallax
 * locations per §6).
 */
export function Gallery() {
  const t = useTranslations();

  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  const resolveSrc = (index: number) => galleryImageOverrides[index] ?? galleryItems[index]?.src;
  const resolveFocus = (index: number) => galleryImageFocus[index] ?? "center";

  const [featured, ...rest] = galleryItems;

  return (
    <Section tone="canvas-soft">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("gallery.heading")}</h2>
          <p className="mt-2 text-ink/70">{t("gallery.intro")}</p>
        </Reveal>

        {/* Mobile: swipeable snap-scroll strip — one row, touch-friendly, no overflow. */}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className="relative h-56 w-[78%] shrink-0 snap-center overflow-hidden rounded-card"
            >
              <Image
                src={resolveSrc(index)}
                alt={t(item.altTranslationKey)}
                fill
                sizes="78vw"
                className="object-cover"
                style={{ objectPosition: resolveFocus(index) }}
              />
            </div>
          ))}
        </div>

        {/* sm+: editorial grid — featured image (parallax + hover) + supporting images.
            `auto-rows-[…]` gives every row a real, explicit height, independent of the
            (absolutely-positioned, zero-intrinsic-height) `fill` images inside each cell —
            CSS Grid's default `align-items: stretch` then sizes every cell div to fill its
            row-span area. Without this, the grid previously collapsed toward 0px, since
            nothing here was contributing flow height for the grid to auto-size against. */}
        <Reveal className="mt-10 hidden sm:block" delayMs={100}>
          <div className="grid grid-cols-4 auto-rows-[170px] gap-5 lg:auto-rows-[200px]">
            <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-card">
              <Parallax strength={18} className="absolute -inset-6">
                <Image
                  src={resolveSrc(0)}
                  alt={t(featured.altTranslationKey)}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  style={{ objectPosition: resolveFocus(0) }}
                />
              </Parallax>
            </div>

            {rest.map((item, restIndex) => {
              const index = restIndex + 1;
              return (
                <div key={item.id} className="group relative overflow-hidden rounded-card">
                  <Image
                    src={resolveSrc(index)}
                    alt={t(item.altTranslationKey)}
                    fill
                    sizes="(min-width: 640px) 25vw, 100vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    style={{ objectPosition: resolveFocus(index) }}
                  />
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
