import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { Audience } from "@/components/audience";
import { siteUrl } from "@/lib/site";
import { LANGS, toLang } from "@/lib/i18n";
import { LangProvider } from "@/lib/i18n-client";
import { siteMessages } from "@/messages/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Chaque page est construite en statique dans les deux langues ; toute autre valeur donne une 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const m = siteMessages[toLang((await params).lang)].meta;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: m.title, template: "%s · IVOLOGIS" },
    description: m.description,
    applicationName: "IVOLOGIS",
    openGraph: { type: "website", locale: m.ogLocale, url: siteUrl, siteName: "IVOLOGIS", title: m.ogTitle, description: m.ogDescription },
    twitter: { card: "summary_large_image", title: "IVOLOGIS", description: m.twitterDescription },
    appleWebApp: { capable: true, title: "IVOLOGIS", statusBarStyle: "default" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B5FFF",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  return (
    <html lang={lang}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Pas de Providers ici : l'accueil et les pages légales s'en passent (≈ 50 ko de JavaScript en moins en 3G). */}
        <LangProvider lang={lang}>
          {children}
          <Audience />
        </LangProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
