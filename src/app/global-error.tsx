"use client";

/**
 * Last-resort boundary — only fires if the ROOT layout itself throws (so,
 * effectively, if next-intl's own locale resolution fails). Because it
 * replaces the root layout, it must render its own <html>/<body> and can't
 * assume globals.css or the locale/translation context are available — so
 * this stays plain, inline-styled, and hardcoded to English on purpose.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.75rem", color: "#444" }}>
          Please try again, or contact us directly if the problem continues.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.65rem 1.5rem",
            borderRadius: "9999px",
            border: "1px solid #333",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
