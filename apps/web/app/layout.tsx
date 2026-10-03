import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";
import { siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "IVOLOGIS — Gestion immobilière en Côte d'Ivoire", template: "%s — IVOLOGIS" },
  description: "Biens, baux, loyers, travaux et relevés propriétaires : la plateforme de gestion locative pour la Côte d'Ivoire.",
  applicationName: "IVOLOGIS",
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: siteUrl,
    siteName: "IVOLOGIS",
    title: "IVOLOGIS — La gestion locative, simple et sécurisée",
    description: "Biens, baux, loyers et relevés propriétaires pour la Côte d'Ivoire.",
  },
  twitter: { card: "summary_large_image", title: "IVOLOGIS", description: "Gestion locative pour la Côte d'Ivoire." },
  appleWebApp: { capable: true, title: "IVOLOGIS", statusBarStyle: "default" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B5FFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
