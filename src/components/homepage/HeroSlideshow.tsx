"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
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


export function HeroSlideshow({ images, className }: HeroSlideshowProps) {
  const t = useTranslations("home");
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotionRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

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
    if (images.length <= 1 || reducedMotionRef.current || pausedRef.current) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, SLIDE_DURATION_MS);
  }, [clearTimer, images.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { reducedMotionRef.current = media.matches; startTimer(); };
    sync(); media.addEventListener("change", sync);
    return () => { clearTimer(); media.removeEventListener("change", sync); };
  }, [startTimer, clearTimer]);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    startTimer();
  }

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

      
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("heroPrevSlide")}
            className={cn(
              "absolute bottom-5 hero-control-prev z-20 flex h-11 w-11 items-center justify-center border border-white/40",
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
              "absolute bottom-5 hero-control-next z-20 flex h-11 w-11 items-center justify-center border border-white/40",
              "bg-ink/30 text-canvas backdrop-blur-sm transition-colors hover:bg-ink/50",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canvas",
            )}
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button type="button" onClick={togglePause} aria-label={t(paused ? "heroPlay" : "heroPause")} className="absolute bottom-5 hero-control-pause z-20 flex h-11 w-11 items-center justify-center border border-white/40 bg-ink/30 text-white hover:bg-ink/50">{paused ? <Play size={16} aria-hidden="true"/> : <Pause size={16} aria-hidden="true"/>}</button>
          <div className="absolute hero-controls-start bottom-5 z-20 flex items-center gap-1">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => goTo(index)}
                aria-label={t("heroGoToSlide", { number: index + 1 })}
                aria-current={index === activeIndex}
                className={cn(
                  "flex h-11 w-10 items-center justify-center border-b-2 text-xs transition-colors",
                  index === activeIndex ? "border-white text-white" : "border-white/25 text-white/70 hover:text-white",
                )}
              >{String(index + 1).padStart(2, "0")}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
