import type { Metadata } from "next";
import { ArtciDeclaration } from "@/components/marketing/legal-identity";

export const metadata: Metadata = { title: "Confidentialité" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-ink">
      <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Politique de confidentialité</h1>
      <p className="mt-2 text-xs text-ink-muted">Dernière mise à jour : novembre 2026</p>

      <h2 className="mt-10 text-lg font-semibold">Cadre</h2>
      <p className="mt-2 text-ink-muted">
        Les données personnelles sont traitées conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en
        Côte d&apos;Ivoire, sous le contrôle de l&apos;ARTCI. <ArtciDeclaration />
      </p>

      <h2 className="mt-10 text-lg font-semibold">Données collectées</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-muted">
        <li>
          <span className="font-medium text-ink">Visiteurs du catalogue</span> (demande de visite ou de réservation, sans compte) : nom, téléphone, email facultatif,
          dates et message saisis.
        </li>
        <li>
          <span className="font-medium text-ink">Demandes de contact</span> : nom, email, téléphone facultatif, organisation et message.
        </li>
        <li>
          <span className="font-medium text-ink">Locataires</span> : identité, coordonnées, pièce d&apos;identité, situation professionnelle et revenus déclarés, garant,
          historique des paiements, baux et demandes de maintenance.
        </li>
        <li>
          <span className="font-medium text-ink">Propriétaires</span> : identité, coordonnées, coordonnées bancaires pour le versement des loyers, biens confiés.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Finalités</h2>
      <p className="mt-2 text-ink-muted">
        Répondre aux demandes de visite, de réservation et de contact ; gérer les biens, les baux, les paiements et la maintenance ; produire les quittances et
        documents contractuels ; assurer la sécurité des accès. Aucune donnée n&apos;est vendue ni cédée à des tiers à des fins commerciales.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Qui accède aux données</h2>
      <p className="mt-2 text-ink-muted">
        L&apos;agence (selon les permissions accordées à chaque agent), chaque propriétaire pour ses seuls biens, chaque locataire pour son seul logement. Le nom
        du propriétaire d&apos;un bien n&apos;est jamais affiché dans le catalogue public.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Hébergement</h2>
      <p className="mt-2 text-ink-muted">
        Les données sont hébergées en Allemagne (Union européenne) par Render et Neon, prestataires techniques de l&apos;agence.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Cookies et stockage local</h2>
      <p className="mt-2 text-ink-muted">
        Le site n&apos;utilise ni publicité ni outil de mesure d&apos;audience. Seuls des éléments techniques sont déposés : le jeton de session et le rôle de
        l&apos;utilisateur connecté (cookies), et les informations de session dans le stockage local du navigateur. Ils disparaissent à la déconnexion.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Durée de conservation</h2>
      <p className="mt-2 text-ink-muted">
        Les données liées à un bail ou à un paiement sont conservées pendant la relation contractuelle puis pendant les délais légaux applicables. Les demandes
        envoyées depuis le catalogue sont conservées le temps de leur traitement par l&apos;agence.
      </p>

      <h2 className="mt-10 text-lg font-semibold">Vos droits</h2>
      <p className="mt-2 text-ink-muted">
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données auprès de l&apos;agence (coordonnées dans les{" "}
        <a href="/mentions-legales" className="font-semibold text-primary hover:underline">
          mentions légales
        </a>
        ). En cas de difficulté, vous pouvez saisir l&apos;ARTCI.
      </p>
    </article>
  );
}
