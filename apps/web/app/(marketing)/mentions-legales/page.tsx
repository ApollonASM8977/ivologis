import type { Metadata } from "next";
import { LegalPublisher } from "@/components/marketing/legal-identity";

export const metadata: Metadata = { title: "Mentions légales" };

export default function LegalPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-ink">
      <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Mentions légales</h1>
      <p className="mt-2 text-xs text-ink-muted">Dernière mise à jour : novembre 2026</p>

      <h2 className="mt-10 text-lg font-semibold">Éditeur</h2>
      <LegalPublisher />

      <h2 className="mt-10 text-lg font-semibold">Hébergement</h2>
      <p className="mt-2 text-ink-muted">
        Application hébergée par Render (Francfort, Allemagne) ; base de données PostgreSQL hébergée par Neon (Francfort, Allemagne).
      </p>

      <h2 className="mt-10 text-lg font-semibold">Propriété intellectuelle</h2>
      <p className="mt-2 text-ink-muted">
        Les éléments de la plateforme (textes, interface) sont protégés. Les logos des opérateurs de paiement appartiennent à leurs marques respectives et sont présentés à titre informatif.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Responsabilité</h2>
      <p className="mt-2 text-ink-muted">
        Les documents générés (baux, quittances) reflètent les informations saisies par l&apos;agence. Il appartient à chaque utilisateur de vérifier leur exactitude avant signature.
      </p>
    </article>
  );
}
