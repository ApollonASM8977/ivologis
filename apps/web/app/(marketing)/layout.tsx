import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MotionConfig } from "motion/react";
import { ScrollProgress } from "@/components/marketing/scroll-progress";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Aller au contenu
      </a>
      <div className="min-h-screen bg-white text-ink">
        <ScrollProgress />
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
