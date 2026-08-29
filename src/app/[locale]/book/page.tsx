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

/**
 * ARCHITECTURE.md §4 documents package cards linking into `/book` with the
 * package preselected via a query param (e.g. `?package=family-day`). This
 * page preserves that pattern rather than inventing a new one, and also
 * accepts `?experience=<id>` as a direct-selection equivalent using the same
 * mechanism.
 *
 * IMPORTANT, flagged explicitly: the Phase 4A booking API/schema validates
 * `type: "experience"` bookings only — neither BOOKING_RULES.md nor
 * DATA_MODEL.md define validation rules for a `type: "package"` request.
 * So a `?package=` link pre-selects the FIRST experience included in that
 * package (still a genuine, fully-validated experience booking) and shows
 * the package only as orientation context in the Experience step — it does
 * not silently pretend to submit a whole-package booking the API can't
 * actually validate.
 */
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
    requestedExperienceId ?? (requestedPackage?.includedExperienceIds[0] ?? null);

  return (
    <Section tone="canvas" className="pt-16 sm:pt-20">
      <Container className="max-w-3xl">
        <BookingFlow
          locale={locale as Locale}
          initialExperienceId={initialExperienceId}
          contextPackageId={requestedPackage?.id ?? null}
        />
      </Container>
    </Section>
  );
}
