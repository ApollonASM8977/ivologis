"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui", background: "#F8FAFC", padding: "3rem", textAlign: "center" }}>
        <h1 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: 600 }}>
          Une erreur inattendue est survenue.
        </h1>
        <p style={{ color: "#6B7280", marginTop: "0.5rem" }}>Veuillez réessayer.</p>
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
          Réessayer
        </button>
      </body>
    </html>
  );
}
