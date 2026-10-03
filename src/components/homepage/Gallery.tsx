"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { gallery as galleryItems } from "@/data/odin/gallery";
import { GalleryLightbox } from "./GalleryLightbox";


const galleryImageOverrides: string[] = [
  "/images/gallery/odin-gallery-01.jpg",
  "/images/gallery/odin-gallery-02.jpg",
  "/images/gallery/odin-gallery-03.jpg",
  "/images/gallery/odin-gallery-04.jpg",
  "/images/gallery/odin-gallery-05.jpg",
];

const galleryImageFocus: string[] = ["45% 40%", "center 60%", "center 45%", "center 45%", "35% 55%"];


export function Gallery() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  const resolveSrc = (index: number) => galleryImageOverrides[index] ?? galleryItems[index]?.src;
  const resolveFocus = (index: number) => galleryImageFocus[index] ?? "center";


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

        
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t(item.altTranslationKey)}
              className="relative h-[400px] w-[88%] shrink-0 snap-center overflow-hidden rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              <Image
                src={resolveSrc(index) ?? item.src}
                alt={t(item.altTranslationKey)}
                fill
                sizes="78vw"
                className="object-cover"
                style={{ objectPosition: resolveFocus(index) }}
              />
            </button>
          ))}
        </div>

        
        <div className="gallery-editorial mt-10 hidden gap-5 sm:grid">
          {galleryItems.map((item, index) => <Reveal key={item.id} variant="scale" className={`gallery-frame gallery-frame-${index}`}>
            <button type="button" onClick={() => setOpenIndex(index)} aria-label={t(item.altTranslationKey)} className="group relative block h-full w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-moss">
              <Image src={resolveSrc(index) ?? item.src} alt={t(item.altTranslationKey)} fill sizes={index === 0 || index > 2 ? "(min-width: 1440px) 580px, 50vw" : "25vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transform-none" style={{objectPosition: resolveFocus(index)}} />
              <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-ink/30 text-white">↗</span>
            </button>
          </Reveal>)}
        </div>

        <GalleryLightbox items={lightboxItems} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
      </Container>
    </Section>
  );
}
