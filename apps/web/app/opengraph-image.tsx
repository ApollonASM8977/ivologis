import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "IVOLOGIS — Gestion immobilière en Côte d'Ivoire";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #0B1F3A 0%, #0B5FFF 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.85 }}>IVOLOGIS</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, marginTop: 24, maxWidth: 950 }}>La gestion locative, simple et sécurisée.</div>
        <div style={{ fontSize: 30, marginTop: 28, opacity: 0.85, maxWidth: 900 }}>Biens, baux, loyers, travaux et relevés propriétaires pour la Côte d&apos;Ivoire.</div>
      </div>
    ),
    { ...size }
  );
}
