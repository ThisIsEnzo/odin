import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/data/odin/site";

/**
 * Organization-level local business data uses only supported locality/map
 * details. Restaurant hours belong to the restaurant and are deliberately
 * excluded from this property-level entity. Mock contact/address details,
 * coordinates, ratings and priceRange are not published.
 */
export async function LocalBusinessJsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.businessName,
    description: t("description"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Khao Mai Kaeo",
      addressRegion: "Chon Buri",
      addressCountry: "TH",
    },
    hasMap: siteConfig.mapsUrl,
  };

  if (siteUrl) data.url = siteUrl;

  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
