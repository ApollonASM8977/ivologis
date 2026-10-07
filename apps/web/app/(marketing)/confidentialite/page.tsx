import type { Metadata } from "next";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-ink">
      <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Politique de confidentialité</h1>
      <p className="mt-2 text-xs text-ink-muted">Dernière mise à jour : octobre 2026</p>

      <h2 className="mt-10 text-lg font-semibold">Données collectées</h2>
      <p className="mt-2 text-ink-muted">
        Identité, coordonnées, pièce d&apos;identité, situation professionnelle et revenus déclarés pour les locataires ; coordonnées bancaires pour le versement des loyers aux propriétaires ; historique des paiements, contrats et demandes de maintenance.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Finalités</h2>
      <p className="mt-2 text-ink-muted">Gérer les biens, les baux, les paiements et la maintenance ; produire les quittances et documents contractuels ; assurer la sécurité des accès.</p>

      <h2 className="mt-10 text-lg font-semibold">Qui accède aux données</h2>
      <p className="mt-2 text-ink-muted">
        L&apos;agence (selon les permissions accordées), chaque propriétaire pour ses seuls biens, chaque locataire pour son seul logement. Aucune donnée n&apos;est vendue ni cédée à des tiers à des fins commerciales.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Durée de conservation</h2>
      <p className="mt-2 text-ink-muted">Les données sont conservées pendant la durée de la relation contractuelle, puis pendant les délais légaux applicables.</p>

      <h2 className="mt-10 text-lg font-semibold">Vos droits</h2>
      <p className="mt-2 text-ink-muted">
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données auprès de votre agence ou via la <a href="/#contact" className="font-semibold text-primary hover:underline">demande de démo</a>. Conformément à la loi n° 2013-450 relative à la protection des données à caractère personnel en Côte d&apos;Ivoire, vous pouvez saisir l&apos;ARTCI.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Déclaration</h2>
      <p className="mt-2 text-ink-muted">
        Numéro de déclaration auprès de l&apos;ARTCI : <span className="font-medium text-ink">[à compléter]</span>
      </p>
    </article>
  );
}
