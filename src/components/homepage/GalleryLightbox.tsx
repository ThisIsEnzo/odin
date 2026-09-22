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

// Minimum horizontal drag distance (px) before a touch gesture counts as a
// swipe rather than a tap/scroll — generous enough to avoid misfiring on
// small accidental finger movement.
const SWIPE_THRESHOLD_PX = 50;

/**
 * PHASE 5A — Gallery lightbox. Reuses Radix Dialog (already a project
 * dependency, already used by MobileNav.tsx for the same reasons: built-in
 * focus trapping, focus return to the trigger on close, and Escape-to-close
 * behavior — nothing about Escape handling needed to be written by hand).
 *
 * Left/right ArrowKey navigation and touch swipe are added on top, since
 * neither is something Radix Dialog provides itself. Both are scoped to
 * only run while the dialog is actually open.
 *
 * This component owns no gallery data itself — `items` is resolved and
 * passed in by Gallery.tsx from the exact same src/data/odin/gallery.ts +
 * translation keys the grid/strip already use, so nothing here duplicates
 * or invents image paths or alt text.
 */
export function GalleryLightbox({ items, openIndex, onOpenIndexChange }: GalleryLightboxProps) {
  const t = useTranslations("gallery.lightbox");
  const touchStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

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

  // Arrow-key navigation — only attached while open, cleaned up on close.
  // Escape itself is handled natively by Dialog.Content, not duplicated here.
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
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => !next && onOpenIndexChange(null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/90" />
        <Dialog.Content
          aria-label={current ? current.alt : undefined}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Radix requires an accessible Title; the image's own alt text
              already carries the description, so the visible title is
              hidden rather than duplicated on-screen. */}
          <Dialog.Title className="sr-only">{current?.alt}</Dialog.Title>

          <Dialog.Close asChild>
            <button
              type="button"
              aria-label={t("close")}
              className={cn(
                "absolute right-4 top-4 z-10 rounded-full bg-canvas/10 p-2.5 text-canvas backdrop-blur-sm",
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
            <div className="relative h-full max-h-[80vh] w-full max-w-4xl">
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
