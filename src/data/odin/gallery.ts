import type { GalleryItem } from "@/types/domain";

/** Local photo assignments. Keep image path, focal point and translated alt together. */
export const gallery: GalleryItem[] = [
  { id: "horse-01", src: "/images/gallery/odin-gallery-01.jpg", altTranslationKey: "gallery.items.horse01.alt", focus: "45% 40%", tags: ["horse-riding"], width: 800, height: 600 },
  { id: "pony-01", src: "/images/gallery/odin-gallery-02.jpg", altTranslationKey: "gallery.items.pony01.alt", focus: "center 60%", tags: ["pony-riding"], width: 800, height: 600 },
  { id: "atv-01", src: "/images/gallery/odin-gallery-03.jpg", altTranslationKey: "gallery.items.atv01.alt", focus: "center 45%", tags: ["atv"], width: 800, height: 600 },
  { id: "sauna-01", src: "/images/gallery/odin-gallery-05.jpg", altTranslationKey: "gallery.items.sauna01.alt", focus: "35% 55%", tags: ["sauna"], width: 800, height: 600 },
  { id: "restaurant-01", src: "/images/gallery/odin-gallery-04.jpg", altTranslationKey: "gallery.items.restaurant01.alt", focus: "center 45%", tags: ["restaurant"], width: 800, height: 600 },
];
