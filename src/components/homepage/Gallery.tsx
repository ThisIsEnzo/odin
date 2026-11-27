"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { gallery as galleryItems } from "@/data/odin/gallery";
import { GalleryLightbox } from "./GalleryLightbox";

const SRC = [
  "/images/gallery/odin-gallery-01.jpg",
  "/images/gallery/odin-gallery-02.jpg",
  "/images/gallery/odin-gallery-03.jpg",
  "/images/gallery/odin-gallery-04.jpg",
  "/images/gallery/odin-gallery-05.jpg",
];
const FOCUS = ["45% 40%", "center 60%", "center 45%", "center 45%", "35% 55%"];

export function Gallery() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!galleryItems || galleryItems.length === 0) return null;
  const items = galleryItems.map((item, i) => ({
    key: item.id, src: SRC[i] ?? item.src, alt: t(item.altTranslationKey), focus: FOCUS[i] ?? "center",
  }));

  return (
    <Section id="gallery" tone="canvas-soft" className="gallery-essay-section">
      <Container>
        <Reveal className="gallery-essay-head">
          <p className="eyebrow text-brand-primary">{t("gallery.heading")}</p>
          <h2 className="gallery-essay-title">{t("gallery.intro")}</h2>
        </Reveal>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
          {items.map((item, i) => (
            <button key={item.key} type="button" onClick={() => setOpenIndex(i)} aria-label={item.alt}
              className="relative h-[420px] w-[88%] shrink-0 snap-center overflow-hidden rounded-card bg-canvas-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark">
              <Image src={item.src} alt={item.alt} fill sizes="88vw" className="object-cover" style={{ objectPosition: item.focus }} />
            </button>
          ))}
        </div>
        <div className="gallery-essay mt-10 hidden sm:grid">
          {items.map((item, i) => (
            <Reveal key={item.key} variant="mask" className={`gallery-frame ge-${i}`}>
              <button type="button" onClick={() => setOpenIndex(i)} aria-label={item.alt}
                className="group relative block h-full w-full overflow-hidden rounded-card bg-canvas-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface-dark">
                <Image src={item.src} alt={item.alt} fill priority={i === 0 || i === 4}
                  sizes={i === 0 ? "(min-width:1024px) 66vw, 100vw" : i === 4 ? "100vw" : "(min-width:1024px) 33vw, 50vw"}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transform-none"
                  style={{ objectPosition: item.focus }} />
                <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-ink/30 text-white">↗</span>
              </button>
            </Reveal>
          ))}
        </div>
        <GalleryLightbox items={items} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
      </Container>
    </Section>
  );
}
