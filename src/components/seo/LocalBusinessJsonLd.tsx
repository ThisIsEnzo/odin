import { getTranslations } from "next-intl/server";
import { restaurant } from "@/data/odin/restaurant";
import { siteConfig } from "@/data/odin/site";

/**
 * Structured data describes the restaurant specifically. Its opening hours
 * must never be interpreted as opening hours for the entire farm/property.
 * Unverified address, telephone, geo, rating and price data are omitted.
 */
export async function LocalBusinessJsonLd({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "meta" });
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: `${siteConfig.businessName} Restaurant`,
    description: t("description"),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: restaurant.operatingHours.open,
        closes: restaurant.operatingHours.close,
      },
    ],
  };

  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
