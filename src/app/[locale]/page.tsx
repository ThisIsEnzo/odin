import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/homepage/Hero";

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Homepage — Phase 3A builds only the Hero (CLAUDE.md §20's remaining nine
 * sections — Experiences, Why ODIN, Packages, Restaurant, Gallery, Reviews,
 * Location, FAQ, Final CTA — are separate, later Phase 3 tasks; see
 * docs/IMPLEMENTATION_PLAN.md). The previous placeholder version of this
 * file also rendered an ad-hoc experiences preview grid to prove the data
 * layer worked end to end — that's removed now that the real, properly
 * scoped Experiences section is a distinct upcoming task, not something to
 * leave half-built alongside a production-quality Hero.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Hero />;
}

function toCamelCase(id: string): string {
  return id.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
