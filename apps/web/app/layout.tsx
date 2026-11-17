import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";
import { siteUrl } from "@/lib/site";

// Polices auto-hébergées par Next (aucun appel à Google côté visiteur) ; titres uniquement pour Fraunces.
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "IVOLOGIS, gestion immobilière en Côte d'Ivoire", template: "%s · IVOLOGIS" },
  description: "Biens, baux, loyers, travaux et relevés propriétaires : la plateforme de gestion locative pour la Côte d'Ivoire.",
  applicationName: "IVOLOGIS",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: siteUrl,
    siteName: "IVOLOGIS",
    title: "IVOLOGIS : la gestion locative, simple et sécurisée",
    description: "Biens, baux, loyers et relevés propriétaires pour la Côte d'Ivoire.",
  },
  twitter: { card: "summary_large_image", title: "IVOLOGIS", description: "Gestion locative pour la Côte d'Ivoire." },
  appleWebApp: { capable: true, title: "IVOLOGIS", statusBarStyle: "default" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B5563",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${body.variable} ${display.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
