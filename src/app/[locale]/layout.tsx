import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Cormorant_Garamond, Noto_Sans_Thai, Noto_Sans_SC } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { HomepageAnchorNavigation } from "@/components/layout/HomepageAnchorNavigation";
import { Footer } from "@/components/layout/Footer";
import { MobileBookBar } from "@/components/layout/MobileBookBar";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import "../globals.css";
import "../living-estate.css";

// Inter (Latin/Cyrillic) is the UI/body workhorse for en + ru. Cormorant
// Garamond is the editorial display voice (also Latin/Cyrillic) wired to
// --font-display in globals.css. Thai/Chinese load alongside and sit in the
// CSS fallback stack so th/zh render correctly with no per-locale branching.
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
const displaySerif = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-display-serif",
  display: "swap",
});
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sc",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
    title: {
      default: t("defaultTitle"),
      template: `%s — ${t("siteName")}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      title: t("defaultTitle"),
      description: t("description"),
      locale,
      images: [{ url: "/images/hero/odin-hero.jpg", width: 2752, height: 1536, alt: t("siteName") }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("description"),
      images: ["/images/hero/odin-hero.jpg"],
    },
    alternates: {
      languages: Object.fromEntries(routing.locales.map((supportedLocale) => [supportedLocale, `/${supportedLocale}`])),
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const common = await getTranslations("common");

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${displaySerif.variable} ${notoSansThai.variable} ${notoSansSC.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <LocalBusinessJsonLd locale={locale} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface-dark focus:px-4 focus:py-2 focus:text-canvas"
          >
            {common("skipToContent")}
          </a>
          <HomepageAnchorNavigation />
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <MobileBookBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
