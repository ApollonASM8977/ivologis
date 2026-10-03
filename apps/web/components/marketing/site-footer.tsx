import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo size="sm" animate={false} />
          <p className="mt-2 text-sm text-ink-muted">Gestion immobilière locative pour la Côte d&apos;Ivoire.</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Produit</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/#fonctionnalites" className="hover:text-primary">Fonctionnalités</Link></li>
            <li><Link href="/#tarifs" className="hover:text-primary">Tarifs</Link></li>
            <li><Link href="/securite" className="hover:text-primary">Sécurité</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Espace client</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/login" className="hover:text-primary">Se connecter</Link></li>
            <li><Link href="/forgot-password" className="hover:text-primary">Mot de passe oublié</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Légal</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li><Link href="/mentions-legales" className="hover:text-primary">Mentions légales</Link></li>
            <li><Link href="/confidentialite" className="hover:text-primary">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-5 text-center text-xs text-ink-muted">
        © {new Date().getFullYear()} IVOLOGIS — Tous droits réservés.
      </div>
    </footer>
  );
}
