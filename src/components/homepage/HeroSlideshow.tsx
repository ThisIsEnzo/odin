"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type HeroSlideshowProps = {
  images: string[];
  className?: string;
};

// Kept in sync with the transition durations declared on .hero-slide in
// globals.css — this is the only place the ROTATION cadence is decided;
// the crossfade/zoom durations themselves live in CSS, not duplicated here.
const SLIDE_DURATION_MS = 10_000;

/**
 * PHASE 4C — replaces the single-image Ken Burns loop with a genuine
 * crossfade slideshow, built generically against an arbitrary-length image
 * array rather than assuming a fixed count.
 *
 * IMPORTANT / FLAGGED: only ONE real hero photo (`odin-hero.jpg`) is
 * confirmed to exist in this project — the same gap page.tsx's own prior
 * comment already flagged. No second/third hero filename is invented here.
 * With a single-entry array this simply shows that one image with its slow
 * one-directional Ken Burns move and never starts the rotation timer below —
 * true crossfade rotation activates automatically, with no code changes,
 * the moment more real photo paths are added to the array this component
 * receives.
 *
 * All images mount from first render (never conditionally mounted /
 * unmounted) — every layer sits in its own absolutely-positioned div, only
 * `opacity`/`transform` toggle via the `.hero-slide-active` class. This is
 * what avoids a "flash while the next image loads" (the browser already has
 * it decoded well before its turn) and any layout shift (every layer is
 * `fill` inside the same sized ancestor page.tsx already provides).
 *
 * Each slide's zoom is driven by a CSS transition (base → active class),
 * not a free-running `@keyframes` loop — that's what guarantees the scale
 * always restarts from 1.02 and climbs to 1.08 monotonically each time a
 * slide becomes active, rather than risking a mid-cycle jump if a
 * continuously-looping keyframe happened to reset while visible.
 */
export function HeroSlideshow({ images, className }: HeroSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Nothing to rotate to with 0–1 images, and reduced-motion visitors get
    // one stable frame — in both cases, never start the timer.
    if (images.length <= 1 || reducedMotion) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, SLIDE_DURATION_MS);

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className={className}>
      {images.map((src, index) => {
        const isActive = index === activeIndex;
        return (
          <div key={src} aria-hidden={!isActive} className={cn("hero-slide", isActive && "hero-slide-active")}>
            {/* Decorative — the frosted content panel carries all the real
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
    </div>
  );
}
