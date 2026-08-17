import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/odin/site";
import { restaurant } from "@/data/odin/restaurant";
import { primaryNavItems, footerNavItems, legalNavItems } from "@/lib/nav-items";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Footer() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[--color-canvas]/10 bg-[--color-moss] text-[--color-canvas]">
      <Container className="grid gap-10 py-12 sm:py-16 md:grid-cols-4">
        <div>
          <p className="font-[--font-display] text-xl">{siteConfig.businessName}</p>
          <p className="mt-2 max-w-xs text-sm text-[--color-canvas]/75">{tFooter("tagline")}</p>
          <p className="mt-4 text-sm text-[--color-canvas]/75">
            {tFooter("openDaily", { hours: `${restaurant.operatingHours.open}–${restaurant.operatingHours.close}` })}
          </p>
        </div>

        <nav aria-label={tFooter("navigationHeading")}>
          <p className="text-sm font-semibold uppercase tracking-wide text-[--color-canvas]/60">
            {tFooter("navigationHeading")}
          </p>
          <ul className="mt-3 space-y-2">
            {[...primaryNavItems, ...footerNavItems].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-[--color-canvas]/85 hover:text-[--color-canvas]">
                  {t(item.translationKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[--color-canvas]/60">
            {tFooter("contactHeading")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[--color-canvas]/85">
            <li>
              <a href={`tel:${siteConfig.phone.value.replace(/\s+/g, "")}`} className="hover:text-[--color-canvas]">
                {siteConfig.phone.value}
              </a>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email.value}`} className="hover:text-[--color-canvas]">
                {siteConfig.email.value}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${siteConfig.whatsapp.value.replace(/[^\d]/g, "")}`}
                className="hover:text-[--color-canvas]"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`https://line.me/ti/p/~${siteConfig.line.value.replace("@", "")}`} className="hover:text-[--color-canvas]">
                LINE {siteConfig.line.value}
              </a>
            </li>
            <li className="pt-1 text-[--color-canvas]/70">{siteConfig.address.value}</li>
            <li className="text-[--color-canvas]/70">
              {tFooter("distanceFromPattaya", { distance: siteConfig.locationDistanceFromPattaya })}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[--color-canvas]/60">
              {tFooter("languageHeading")}
            </p>
            <LanguageSwitcher className="mt-3 [color-scheme:dark]" />
          </div>
          <ul className="flex gap-4 text-sm text-[--color-canvas]/75">
            {legalNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[--color-canvas]">
                  {t(item.translationKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-[--color-canvas]/10 py-4">
        <Container>
          <p className="text-xs text-[--color-canvas]/60">
            © {year} {siteConfig.businessName}. {tFooter("rightsReserved")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
