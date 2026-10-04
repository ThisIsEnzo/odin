import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Noto_Sans_Thai, Noto_Sans_SC } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { HomepageAnchorNavigation } from "@/components/layout/HomepageAnchorNavigation";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";

// Latin/Cyrillic fonts cover en + ru directly. Thai/Chinese are loaded
// alongside and referenced later in the CSS font-family fallback stack
// (globals.css) so th/zh render correctly without any per-locale branching
// in components — see the comment there for how that works.
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });
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
  return {
    title: {
      default: t("defaultTitle"),
      template: `%s — ${t("siteName")}`,
    },
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale subtree.
  setRequestLocale(locale);

  // Required so CLIENT components (LanguageSwitcher, MobileNav) have
  // messages to read — useTranslations() in a Server Component reads the
  // request context directly and doesn't need this, but it does need to
  // cross the server/client boundary explicitly for anything marked
  // "use client". Without this, next-intl throws in those components.
  const messages = await getMessages();
  const common = await getTranslations("common");

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSansThai.variable} ${notoSansSC.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-moss focus:px-4 focus:py-2 focus:text-canvas"
          >
            {common("skipToContent")}
          </a>
          <HomepageAnchorNavigation />
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
