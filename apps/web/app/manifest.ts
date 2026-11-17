import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gestion immobilière IVOLOGIS",
    short_name: "IVOLOGIS",
    description: "Gestion locative pour la Côte d'Ivoire : biens, baux, loyers, travaux et relevés.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0B5FFF",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
