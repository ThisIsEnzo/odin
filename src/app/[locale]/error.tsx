"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

/**
 * Segment-level error boundary. Next.js requires this to be a Client
 * Component. We only log to the console here — CLAUDE.md §28 says never
 * expose internal server errors to users, so the on-screen copy stays
 * generic regardless of what actually broke. Swap the console.error for a
 * real logger (Sentry etc.) once one is chosen; not needed for Phase 1.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section tone="canvas" className="py-24 text-center">
      <Container>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-ink/75">{t("description")}</p>
        <div className="mt-8">
          <Button variant="primary" onClick={reset}>
            {t("retry")}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
