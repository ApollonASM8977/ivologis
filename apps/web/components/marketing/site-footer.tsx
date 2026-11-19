import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { FooterLegalLine } from "@/components/marketing/legal-identity";
import type { Lang } from "@/lib/i18n";
import { marketingMessages } from "@/messages/marketing";

export function SiteFooter({ lang }: { lang: Lang }) {
  const m = marketingMessages[lang];
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo size="sm" animate={false} />
          <p className="mt-2 text-sm text-ink-muted">{m.footer.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{m.footer.product}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/#fonctionnalites" className="hover:text-primary">{m.nav.features}</Link></li>
            <li><Link href="/#tarifs" className="hover:text-primary">{m.nav.pricing}</Link></li>
            <li><Link href="/securite" className="hover:text-primary">{m.nav.security}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{m.footer.clientArea}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/login" className="hover:text-primary">{m.login}</Link></li>
            <li><Link href="/forgot-password" className="hover:text-primary">{m.footer.forgotPassword}</Link></li>
            <li><Link href="/catalogue/suivi" className="hover:text-primary">{m.footer.trackRequest}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{m.footer.legal}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/verification" className="hover:text-primary">{m.footer.verification}</Link></li>
            <li><Link href="/mentions-legales" className="hover:text-primary">{m.footer.legalNotice}</Link></li>
            <li><Link href="/confidentialite" className="hover:text-primary">{m.footer.privacy}</Link></li>
            <li><Link href="/conditions-generales" className="hover:text-primary">{m.footer.terms}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-5 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} IVOLOGIS. {m.footer.rights}
        <FooterLegalLine lang={lang} />
      </div>
    </footer>
  );
}
