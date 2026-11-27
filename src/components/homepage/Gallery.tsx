"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { gallery as galleryItems } from "@/data/odin/gallery";
import { GalleryLightbox } from "./GalleryLightbox";

export function Gallery() {
  const t = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  if (galleryItems.length === 0) return null;

  const markImageFailed = (key: string) => {
    setFailedImages((previous) => {
      if (previous.has(key)) return previous;
      const next = new Set(previous);
      next.add(key);
      return next;
    });
  };

  const items = galleryItems.map((item) => ({
    key: item.id,
    src: item.src,
    alt: t(item.altTranslationKey),
    focus: item.focus ?? "center",
  }));

  return (
    <Section id="gallery" tone="canvas-soft" className="gallery-essay-section">
      <Container>
        <Reveal className="gallery-essay-head">
          <p className="eyebrow text-brand-primary">{t("gallery.heading")}</p>
          <h2 className="gallery-essay-title">{t("gallery.intro")}</h2>
        </Reveal>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={failedImages.has(item.key)}
              onClick={() => setOpenIndex(items.findIndex((entry) => entry.key === item.key))}
              aria-label={item.alt}
              className="relative h-[420px] w-[88%] shrink-0 snap-center overflow-hidden rounded-card bg-canvas-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-dark"
            >
              {failedImages.has(item.key) ? (
                <div className="gallery-image-fallback" aria-hidden="true"><span>ON GROUND</span></div>
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="88vw"
                  className="object-cover"
                  style={{ objectPosition: item.focus }}
                  onError={() => markImageFailed(item.key)}
                />
              )}
            </button>
          ))}
        </div>
        <div className="gallery-essay mt-10 hidden sm:grid">
          {items.map((item, i) => (
            <Reveal key={item.key} variant="mask" className={"gallery-frame ge-" + i}>
              <button
                type="button"
                disabled={failedImages.has(item.key)}
                onClick={() => setOpenIndex(i)}
                aria-label={item.alt}
                className="group relative block h-full w-full overflow-hidden rounded-card bg-canvas-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-surface-dark"
              >
                {failedImages.has(item.key) ? (
                  <div className="gallery-image-fallback" aria-hidden="true"><span>ON GROUND</span></div>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    priority={i === 0 || i === 4}
                    sizes={i === 0 ? "(min-width:1024px) 66vw, 100vw" : i === 4 ? "100vw" : "(min-width:1024px) 33vw, 50vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transform-none"
                    style={{ objectPosition: item.focus }}
                    onError={() => markImageFailed(item.key)}
                  />
                )}
                {!failedImages.has(item.key) ? (
                  <span aria-hidden="true" className="gallery-expand"><Maximize2 size={16} /></span>
                ) : null}
              </button>
            </Reveal>
          ))}
        </div>
        <GalleryLightbox items={items} openIndex={openIndex} onOpenIndexChange={setOpenIndex} />
      </Container>
    </Section>
  );
}
