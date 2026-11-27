/** ON GROUND — shared motion system ("The Slow Country"). */
export const MOTION = {
  duration: { fast: 180, base: 320, slow: 640, cinematic: 1100, hero: 1400 },
  ease: { out: "cubic-bezier(0.16, 1, 0.3, 1)", inOut: "cubic-bezier(0.65, 0, 0.35, 1)", soft: "cubic-bezier(0.33, 1, 0.68, 1)" },
  distance: { sm: 12, md: 24, lg: 48 },
  stagger: { word: 55, line: 90, item: 110 },
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function isTouchLayout(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}
type ScrollItem = { el: HTMLElement; update: (progress: number, rect: DOMRect) => void };
const items = new Set<ScrollItem>();
let frame = 0;
let listening = false;

function measure() {
  frame = 0;
  const vh = window.innerHeight || 1;
  const reads: Array<{ item: ScrollItem; progress: number; rect: DOMRect }> = [];
  items.forEach((item) => {
    const rect = item.el.getBoundingClientRect();
    const progress = (vh - rect.top) / (vh + rect.height);
    reads.push({ item, progress: Math.max(0, Math.min(1, progress)), rect });
  });
  for (const { item, progress, rect } of reads) item.update(progress, rect);
}
function schedule() { if (!frame) frame = requestAnimationFrame(measure); }
function ensureListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}
function maybeStop() {
  if (items.size || !listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) { cancelAnimationFrame(frame); frame = 0; }
}
export function registerScrollItem(el: HTMLElement, update: (progress: number, rect: DOMRect) => void): () => void {
  const item = { el, update };
  items.add(item);
  ensureListening();
  schedule();
  return () => { items.delete(item); maybeStop(); };
}
