import type { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { LANG_COOKIE } from "@/lib/i18n";

/** Application installée (PWA) : nom et description dans la langue choisie. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const en = (await cookies()).get(LANG_COOKIE)?.value === "en";
  return {
    name: en ? "IVOLOGIS property management" : "Gestion immobilière IVOLOGIS",
    short_name: "IVOLOGIS",
    description: en
      ? "Rental management for Côte d'Ivoire: properties, leases, rent, repairs and statements."
      : "Gestion locative pour la Côte d'Ivoire : biens, baux, loyers, travaux et relevés.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FAFC",
    theme_color: "#0B5FFF",
    lang: en ? "en" : "fr",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
