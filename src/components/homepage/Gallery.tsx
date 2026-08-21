import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { galleryItems } from "@/data/odin/gallery";

/**
 * NOTE: `galleryItems` is imported from src/data/odin/gallery.ts per
 * ARCHITECTURE.md (`gallery.ts # GalleryItem[]`) and DATA_MODEL.md's
 * GalleryItem type (id, src, altTranslationKey, width, height). This file
 * was not part of the material supplied for this phase — the import name
 * is a best-effort match to the documented architecture and should be
 * verified against the real file before merge. No external image URLs are
 * introduced; every `src` is expected to resolve to a local asset already
 * referenced by the data layer (see MOCK_DATA.md §5 on gallery photography).
 */
export function Gallery() {
  const t = useTranslations();

  if (!galleryItems || galleryItems.length === 0) {
    return null;
  }

  const [featured, ...rest] = galleryItems;

  return (
    <Section tone="canvas-soft">
      <Container>
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">{t("gallery.heading")}</h2>
          <p className="mt-2 text-ink/70">{t("gallery.intro")}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          <div className="group relative col-span-2 row-span-2 overflow-hidden rounded-card">
            <Image
              src={featured.src}
              alt={t(featured.altTranslationKey)}
              width={featured.width}
              height={featured.height}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>

          {rest.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "group relative overflow-hidden rounded-card",
                index === 0 && "col-span-2 sm:col-span-2",
              )}
            >
              <Image
                src={item.src}
                alt={t(item.altTranslationKey)}
                width={item.width}
                height={item.height}
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
