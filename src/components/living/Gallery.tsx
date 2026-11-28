"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { gallery } from "@/data/odin/gallery";
import { GalleryLightbox } from "@/components/homepage/GalleryLightbox";

export function Gallery() {
  const t = useTranslations();
  const [open, setOpen] = useState<number | null>(null);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  if (!gallery.length) return null;

  const items = gallery.map((item) => ({
    key: item.id,
    src: item.src,
    alt: t(item.altTranslationKey),
    focus: item.focus ?? "center",
  }));

  const markFailed = (key: string) => {
    setFailed((previous) => {
      if (previous.has(key)) return previous;
      const next = new Set(previous);
      next.add(key);
      return next;
    });
  };

  return (
    <section id="gallery" className="le-gal" aria-labelledby="le-gallery-title">
      <div className="le-wrap">
        <p className="le-note">05</p>
        <h2 id="le-gallery-title" className="le-display le-gallery-title">{t("gallery.intro")}</h2>
        <div className="le-mosaic">
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className="le-frame"
              onClick={() => !failed.has(item.key) && setOpen(index)}
              disabled={failed.has(item.key)}
              aria-label={item.alt}
            >
              {failed.has(item.key) ? (
                <span className="le-frame-fallback" aria-hidden="true">ON GROUND</span>
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  priority={index === 0}
                  sizes="(min-width:1024px) 40vw, (min-width:768px) 50vw, 100vw"
                  style={{ objectPosition: item.focus }}
                  onError={() => markFailed(item.key)}
                />
              )}
              {!failed.has(item.key) ? (
                <span className="le-expand" aria-hidden="true"><Maximize2 size={15} /></span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      <GalleryLightbox items={items} openIndex={open} onOpenIndexChange={setOpen} />
    </section>
  );
}
