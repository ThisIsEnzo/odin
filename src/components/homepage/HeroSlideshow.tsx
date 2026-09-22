"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HeroSlideshowProps = {
  images: string[];
  className?: string;
};

// Kept in sync with the transition durations declared on .hero-slide in
// globals.css — this is the only place the ROTATION cadence is decided;
// the crossfade/zoom durations themselves live in CSS, not duplicated here.
// PHASE 5A spec calls for an 8-10s interval; 10s (the top of that range) is
// carried over unchanged from Phase 4C rather than re-picked arbitrarily,
// since it was already tuned against the CSS transition durations below.
const SLIDE_DURATION_MS = 10_000;

/**
 * PHASE 4C established the crossfade/Ken-Burns mechanism this still uses
 * unchanged: every image mounts from first render (never conditionally
 * mounted/unmounted), sits in its own absolutely-positioned layer, and only
 * `opacity`/`transform` toggle via the `.hero-slide-active` class - driven
 * by a CSS transition, not a free-running `@keyframes` loop, so the zoom
 * always restarts from 1.02 and climbs to 1.08 monotonically each time a
 * slide becomes active.
 *
 * PHASE 5A adds the manual controls this component didn't have before:
 * previous/next arrows and dot navigation, rendered only when there's more
 * than one image to move between (this replaces the Phase 4C placeholder in
 * page.tsx that reserved space for progress dots but never actually
 * rendered any). Autoplay and manual navigation share one `activeIndex`
 * state and one timer, coordinated through `startTimer()`: any manual
 * interaction restarts the auto-advance clock, so a visitor who just
 * clicked "next" isn't immediately auto-advanced past the slide they chose
 * to look at.
 *
 * IMPORTANT / FLAGGED (carried over from Phase 4C, still true): only ONE
 * real hero photo (`odin-hero.jpg`) is confirmed to exist in this project -
 * this environment has no access to `public/images/hero/` to verify
 * anything beyond that, and no second/third hero filename is invented here.
 * With a single-entry array this renders that one image with its slow
 * one-directional Ken Burns move, no controls, and never starts the
 * rotation timer. True crossfade rotation and the manual controls below
 * activate automatically, with no further code changes, the moment more
 * real photo paths are supplied to the `images` array this component
 * receives from page.tsx.
 */
export function HeroSlideshow({ images, className }: HeroSlideshowProps) {
  const t = useTranslations("home");
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotionRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    // Nothing to rotate to with 0-1 images, and reduced-motion visitors get
    // one stable frame - in both cases, never (re)start the automatic
    // timer. Manual controls still work in both cases; only the automatic
    // advance is gated on these two conditions.
    if (images.length <= 1 || reducedMotionRef.current) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, SLIDE_DURATION_MS);
  }, [clearTimer, images.length]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    startTimer();
    return clearTimer;
    // Re-run only when the image count actually changes - startTimer/
    // clearTimer are stable across renders (useCallback) except when
    // images.length changes, which is already the dependency that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % images.length) + images.length) % images.length);
      startTimer(); // manual interaction restarts the auto-advance clock
    },
    [images.length, startTimer],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  if (images.length === 0) return null;

  const hasMultiple = images.length > 1;

  return (
    <div className={className}>
      {images.map((src, index) => {
        const isActive = index === activeIndex;
        return (
          <div key={src} aria-hidden={!isActive} className={cn("hero-slide", isActive && "hero-slide-active")}>
            {/* Decorative - the frosted content panel carries all the real
                information, same convention as the previous single-image
                version. */}
            <Image
              src={src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-[75%_55%] sm:object-[65%_50%]"
            />
          </div>
        );
      })}

      {/* Manual controls - only meaningful, and only rendered, with 2+
          images. Positioned relative to this component's own root, which is
          itself `absolute inset-0` (via the className page.tsx passes in),
          so no extra positioning wrapper is needed. */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("heroPrevSlide")}
            className={cn(
              "absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 sm:left-5 sm:p-2.5",
              "bg-ink/30 text-canvas backdrop-blur-sm transition-colors hover:bg-ink/50",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas",
            )}
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label={t("heroNextSlide")}
            className={cn(
              "absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 sm:right-5 sm:p-2.5",
              "bg-ink/30 text-canvas backdrop-blur-sm transition-colors hover:bg-ink/50",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas",
            )}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2.5">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(index)}
                aria-label={t("heroGoToSlide", { number: index + 1 })}
                aria-current={index === activeIndex}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  index === activeIndex ? "w-6 bg-canvas" : "w-2.5 bg-canvas/50 hover:bg-canvas/75",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
