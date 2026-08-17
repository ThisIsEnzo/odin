import type { GalleryItem } from "@/types/domain";

/**
 * Real photography isn't available yet (CLAUDE.md §23 explicitly directs
 * local placeholders over unstable external URLs). Every entry below points
 * at a real local asset — public/images/gallery/placeholder.svg — rather
 * than a path that doesn't exist. Replace src/width/height per item once
 * real photos land; the shape (id, tags, altTranslationKey) shouldn't need
 * to change.
 */
export const gallery: GalleryItem[] = [
  {
    id: "horse-01",
    src: "/images/gallery/placeholder.svg",
    altTranslationKey: "gallery.items.horse01.alt",
    tags: ["horse-riding"],
    width: 800,
    height: 600,
  },
  {
    id: "pony-01",
    src: "/images/gallery/placeholder.svg",
    altTranslationKey: "gallery.items.pony01.alt",
    tags: ["pony-riding"],
    width: 800,
    height: 600,
  },
  {
    id: "atv-01",
    src: "/images/gallery/placeholder.svg",
    altTranslationKey: "gallery.items.atv01.alt",
    tags: ["atv"],
    width: 800,
    height: 600,
  },
  {
    id: "sauna-01",
    src: "/images/gallery/placeholder.svg",
    altTranslationKey: "gallery.items.sauna01.alt",
    tags: ["sauna"],
    width: 800,
    height: 600,
  },
  {
    id: "restaurant-01",
    src: "/images/gallery/placeholder.svg",
    altTranslationKey: "gallery.items.restaurant01.alt",
    tags: ["restaurant"],
    width: 800,
    height: 600,
  },
];
