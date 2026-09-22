"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { gallery as galleryItems } from "@/data/odin/gallery";
import { GalleryLightbox } from "./GalleryLightbox";

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
 * CINEMATIC MOTION REFINEMENT: each gallery image now reveals individually
 * (opacity + scale 0.97→1 + a small translateY, via Reveal's
 * `variant="scale"`) with a modest per-image stagger, instead of the whole
 * grid fading up as one block — "photographs entering the frame," per this
 * phase's spec. Mobile snap-scroll is untouched.
 */
export function Gallery() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  const resolveSrc = (index: number) => galleryImageOverrides[index] ?? galleryItems[index]?.src;
  const resolveFocus = (index: number) => galleryImageFocus[index] ?? "center";

  const [featured, ...rest] = galleryItems;

  const lightboxItems = galleryItems.map((item, index) => ({
    key: item.id,
    // resolveSrc(index) types as `string | undefined` under this project's
    // noUncheckedIndexedAccess setting (it indexes the overrides array,
    // which may run shorter than galleryItems). Falling back to the item's
    // own src (GalleryItem.src is a required string, never optional) keeps
    // this genuinely always-a-string rather than just silencing the type
    // error, and matches what the grid/strip already do implicitly.
    src: resolveSrc(index) ?? item.src,
    alt: t(item.altTranslationKey),
    focus: resolveFocus(index),
  }));

  return (
    <Section id="gallery" tone="canvas-soft">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("gallery.heading")}</h2>
          <p className="mt-2 text-ink/70">{t("gallery.intro")}</p>
        </Reveal>

        {/* Mobile: swipeable snap-scroll strip — one row, touch-friendly, no overflow.
            Each image is now a real button that opens the lightbox at that index. */}
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t(item.altTranslationKey)}
              className="relative h-56 w-[78%] shrink-0 snap-center overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              <Image
                src={resolveSrc(index)}
                alt={t(item.altTranslationKey)}
                fill
                sizes="78vw"
                className="object-cover"
                style={{ objectPosition: resolveFocus(index) }}
              />
            </button>
          ))}
        </div>

        {/* sm+: editorial grid — featured image (parallax + hover) + supporting images.
            `auto-rows-[…]` gives every row a real, explicit height, independent of the
            (absolutely-positioned, zero-intrinsic-height) `fill` images inside each cell —
            CSS Grid's default `align-items: stretch` then sizes every cell div to fill its
            row-span area. Without this, the grid previously collapsed toward 0px, since
            nothing here was contributing flow height for the grid to auto-size against. */}
        <div className="mt-10 hidden sm:block">
          <div className="grid grid-cols-4 auto-rows-[170px] gap-5 lg:auto-rows-[200px]">
            <Reveal
              variant="scale"
              className="group relative col-span-2 row-span-2 overflow-hidden rounded-card"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(0)}
                aria-label={t(featured.altTranslationKey)}
                className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                <Parallax strength={22} className="absolute -inset-6">
                  <Image
                    src={resolveSrc(0)}
                    alt={t(featured.altTranslationKey)}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    style={{ objectPosition: resolveFocus(0) }}
                  />
                </Parallax>
              </button>
            </Reveal>

            {rest.map((item, restIndex) => {
              const index = restIndex + 1;
              return (
                <Reveal
                  key={item.id}
                  variant="scale"
                  delayMs={Math.min((restIndex + 1) * 60, 240)}
                  className="group relative overflow-hidden rounded-card"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    aria-label={t(item.altTranslationKey)}
                    className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                  >
                    <Image
                      src={resolveSrc(index)}
                      alt={t(item.altTranslationKey)}
                      fill
                      sizes="(min-width: 640px) 25vw, 100vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      style={{ objectPosition: resolveFocus(index) }}
                    />
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>

        <GalleryLightbox items={lightboxItems} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
      </Container>
    </Section>
  );
}
