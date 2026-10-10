import { BrandLogo } from "./BrandLogo";
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
    <footer className="ground-footer border-t border-brand-cream/20">
      <Container className="grid gap-x-10 gap-y-12 py-16 break-words sm:py-20 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr_.8fr]">
        <div>
          
          <BrandLogo full className="mb-6" />
          <p className="sr-only">{siteConfig.businessName}</p>
          <p className="mt-2 max-w-xs text-sm text-brand-cream/90">{tFooter("tagline")}</p>
          <p className="mt-4 text-sm text-brand-cream/90">
            {tFooter("openDaily", { hours: `${restaurant.operatingHours.open}–${restaurant.operatingHours.close}` })}
          </p>
        </div>

        <nav aria-label={tFooter("navigationHeading")}>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-cream/85">
            {tFooter("navigationHeading")}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 sm:block sm:space-y-2">
            {[...primaryNavItems, ...footerNavItems].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-brand-cream hover:text-canvas">
                  {t(item.translationKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-cream/85">
            {tFooter("contactHeading")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-brand-cream">
            {!siteConfig.phone.isMock&&<li><a href={`tel:${siteConfig.phone.value.replace(/\s+/g, "")}`}>{siteConfig.phone.value}</a></li>}
            {!siteConfig.email.isMock&&<li><a href={`mailto:${siteConfig.email.value}`}>{siteConfig.email.value}</a></li>}
            {!siteConfig.whatsapp.isMock&&<li><a href={`https://wa.me/${siteConfig.whatsapp.value.replace(/[^\d]/g, "")}`}>WhatsApp</a></li>}
            {!siteConfig.line.isMock&&<li><a href={`https://line.me/ti/p/~${siteConfig.line.value.replace("@", "")}`}>LINE {siteConfig.line.value}</a></li>}
            {!siteConfig.address.isMock&&<li>{siteConfig.address.value}</li>}
            <li>{tFooter("distanceFromPattaya", { distance: siteConfig.locationDistanceFromPattaya })}</li>
            <li><Link href="/book">{tFooter("requestContact")}</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-cream/85">
              {tFooter("languageHeading")}
            </p>
            <LanguageSwitcher className="mt-3 [color-scheme:dark] [&_select]:text-brand-cream [&_select]:border-brand-cream/40 [&_select:focus-visible]:outline-brand-cream [&_option]:bg-surface-dark" />
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-brand-cream/90">
            {legalNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-canvas">
                  {t(item.translationKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-brand-cream/20 py-4">
        <Container>
          <p className="text-xs text-brand-cream/85">
            © {year} {siteConfig.businessName}. {tFooter("rightsReserved")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
