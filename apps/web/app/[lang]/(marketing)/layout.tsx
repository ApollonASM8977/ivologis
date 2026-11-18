import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ScrollProgress } from "@/components/marketing/scroll-progress";
import { toLang } from "@/lib/i18n";
import { siteMessages } from "@/messages/site";

export default async function MarketingLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const lang = toLang((await params).lang);
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        {siteMessages[lang].skipToContent}
      </a>
      <div className="min-h-screen bg-white text-ink">
        <ScrollProgress />
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter lang={lang} />
      </div>
    </>
  );
}
