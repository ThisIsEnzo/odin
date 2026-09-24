import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { BookingFlow } from "@/components/domain/booking/BookingFlow";
import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import type { ExperienceId, Locale } from "@/types/domain";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ experience?: string; package?: string }>;
};

const experienceIdSet = new Set(experiences.map((e) => e.id));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return { title: t("pageTitle") };
}

export default async function BookPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const requestedExperienceId: ExperienceId | null =
    sp.experience && experienceIdSet.has(sp.experience as ExperienceId)
      ? (sp.experience as ExperienceId)
      : null;

  const requestedPackage = sp.package
    ? (packages.find((p) => p.slug === sp.package || p.id === sp.package) ?? null)
    : null;

  const initialExperienceId: ExperienceId | null =
    requestedExperienceId;

  return (
    <Section tone="canvas" className="pt-16 sm:pt-20">
      <Container className="max-w-4xl">
        <BookingFlow
          locale={locale as Locale}
          initialExperienceId={initialExperienceId}
          contextPackageId={requestedPackage?.id ?? null}
        />
      </Container>
    </Section>
  );
}
