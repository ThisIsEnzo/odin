"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface LightboxItem {
  key: string;
  src: string;
  alt: string;
  focus: string;
}

export interface GalleryLightboxProps {
  items: LightboxItem[];
  openIndex: number | null;
  onOpenIndexChange: (index: number | null) => void;
}

const SWIPE_THRESHOLD_PX = 50;

/**
 * Gallery lightbox built on Radix Dialog (focus trap, focus return, Escape).
 * Arrow-key navigation and touch swipe are added on top. The swipe now gives
 * live visual feedback: the image follows the finger and settles on release.
 */
export function GalleryLightbox({ items, openIndex, onOpenIndexChange }: GalleryLightboxProps) {
  const t = useTranslations("gallery.lightbox");
  const touchStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useRef(false);
  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const isOpen = openIndex !== null;
  const current = isOpen ? items[openIndex] : null;

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      onOpenIndexChange(((index % items.length) + items.length) % items.length);
    },
    [items.length, onOpenIndexChange],
  );

  const goPrev = useCallback(() => {
    if (openIndex === null) return;
    goTo(openIndex - 1);
  }, [openIndex, goTo]);

  const goNext = useCallback(() => {
    if (openIndex === null) return;
    goTo(openIndex + 1);
  }, [openIndex, goTo]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goPrev, goNext]);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setDragOffset(0);
    setDragging(true);
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const currentX = event.touches[0]?.clientX ?? touchStartX.current;
    setDragOffset(currentX - touchStartX.current);
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) return;
    if (dragOffset <= -SWIPE_THRESHOLD_PX) {
      goNext();
    } else if (dragOffset >= SWIPE_THRESHOLD_PX) {
      goPrev();
    }
    touchStartX.current = null;
    setDragOffset(0);
    setDragging(false);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => !next && onOpenIndexChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/90" />
        <Dialog.Content
          aria-label={current ? current.alt : undefined}
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Dialog.Title className="sr-only">{current?.alt}</Dialog.Title>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label={t("close")}
              className={cn(
                "absolute right-4 top-4 z-10 min-h-11 min-w-11 rounded-full bg-canvas/10 p-2.5 text-canvas backdrop-blur-sm",
                "hover:bg-canvas/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas",
              )}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label={t("previous")}
                className={cn(
                  "absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-canvas/10 p-2.5 text-canvas backdrop-blur-sm sm:left-4",
                  "hover:bg-canvas/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas",
                )}
              >
                <ChevronLeft aria-hidden="true" className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={t("next")}
                className={cn(
                  "absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-canvas/10 p-2.5 text-canvas backdrop-blur-sm sm:right-4",
                  "hover:bg-canvas/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas",
                )}
              >
                <ChevronRight aria-hidden="true" className="h-6 w-6" />
              </button>
            </>
          )}

          {current && (
            <div
              className="relative h-full max-h-[80vh] w-full max-w-4xl touch-pan-y"
              style={{
                transform: reduceMotion.current ? undefined : `translateX(${dragOffset}px)`,
                transition: dragging ? "none" : "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-contain"
                style={{ objectPosition: current.focus }}
                priority
              />
            </div>
          )}

          {items.length > 1 && openIndex !== null && (
            <p className="mt-4 text-sm text-canvas/80">
              {t("counter", { current: openIndex + 1, total: items.length })}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
