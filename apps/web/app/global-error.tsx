"use client";

// Remplace toute la page (y compris la mise en page qui porte la langue) : la langue est lue dans le cookie.
const TEXT = {
  fr: { title: "Une erreur inattendue est survenue.", text: "Veuillez réessayer.", retry: "Réessayer" },
  en: { title: "An unexpected error occurred.", text: "Please try again.", retry: "Try again" },
};

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const lang = typeof document !== "undefined" && /(?:^|;\s*)ivologis_lang=en\b/.test(document.cookie) ? "en" : "fr";
  const m = TEXT[lang];
  return (
    <html lang={lang}>
      <body style={{ fontFamily: "system-ui", background: "#F8FAFC", padding: "3rem", textAlign: "center" }}>
        <h1 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: 600 }}>{m.title}</h1>
        <p style={{ color: "#6B7280", marginTop: "0.5rem" }}>{m.text}</p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1.5rem",
            background: "#0B5FFF",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.625rem 1.25rem",
            cursor: "pointer",
          }}
        >
          {m.retry}
        </button>
      </body>
    </html>
  );
}
