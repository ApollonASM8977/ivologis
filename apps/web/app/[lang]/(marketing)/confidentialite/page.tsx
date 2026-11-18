import type { Metadata } from "next";
import { ArtciDeclaration } from "@/components/marketing/legal-identity";
import { toLang, type Lang } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: toLang((await params).lang) === "en" ? "Privacy" : "Confidentialité" };
}

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-10 text-lg font-semibold">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-2 text-ink-muted">{children}</p>;
const Who = ({ children }: { children: React.ReactNode }) => <span className="font-medium text-ink">{children}</span>;
const LegalLink = ({ children }: { children: React.ReactNode }) => (
  <a href="/mentions-legales" className="font-semibold text-primary hover:underline">
    {children}
  </a>
);

function Body({ lang }: { lang: Lang }) {
  if (lang === "en") {
    return (
      <>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Privacy policy</h1>
        <p className="mt-2 text-xs text-ink-muted">Last updated: November 2026</p>
        <H2>Framework</H2>
        <P>
          Personal data is processed in accordance with Law No. 2013-450 of 19 June 2013 on the protection of personal data in Côte d&apos;Ivoire, under the
          supervision of ARTCI. <ArtciDeclaration lang={lang} />
        </P>
        <H2>Data collected</H2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-muted">
          <li>
            <Who>Catalogue visitors</Who> (viewing or booking request, without an account): name, phone, optional email, dates and message entered.
          </li>
          <li>
            <Who>Contact requests</Who>: name, email, optional phone, organisation and message.
          </li>
          <li>
            <Who>Tenants</Who>: identity, contact details, ID document, employment and declared income, guarantor, payment history, leases and maintenance
            requests.
          </li>
          <li>
            <Who>Owners</Who>: identity, contact details, bank details for rent transfers, properties entrusted.
          </li>
        </ul>
        <H2>Purposes</H2>
        <P>
          Responding to viewing, booking and contact requests; managing properties, leases, payments and maintenance; producing receipts and contractual
          documents; securing access. No data is sold or transferred to third parties for commercial purposes.
        </P>
        <H2>Who can access the data</H2>
        <P>
          The agency (according to the permissions granted to each agent), each owner for their own properties only, each tenant for their own home only. A
          property owner&apos;s name is never shown in the public catalogue.
        </P>
        <H2>Hosting</H2>
        <P>Data is hosted in Germany (European Union) by Render and Neon, the agency&apos;s technical providers.</P>
        <H2>Cookies and local storage</H2>
        <P>
          The site uses no advertising and no audience measurement tools. Only technical items are stored: the session token and role of the signed-in user
          (cookies, removed when signing out), the chosen language (cookie, kept for one year), and session information in the browser&apos;s local storage.
        </P>
        <H2>Retention period</H2>
        <P>
          Data linked to a lease or a payment is kept for the duration of the contractual relationship and then for the applicable legal periods. Requests sent
          from the catalogue are kept while the agency processes them.
        </P>
        <H2>Your rights</H2>
        <P>
          You can request access to, correction or deletion of your data from the agency (contact details in the <LegalLink>legal notice</LegalLink>). If you
          encounter any difficulty, you can contact ARTCI.
        </P>
      </>
    );
  }
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Politique de confidentialité</h1>
      <p className="mt-2 text-xs text-ink-muted">Dernière mise à jour : novembre 2026</p>
      <H2>Cadre</H2>
      <P>
        Les données personnelles sont traitées conformément à la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en
        Côte d&apos;Ivoire, sous le contrôle de l&apos;ARTCI. <ArtciDeclaration lang={lang} />
      </P>
      <H2>Données collectées</H2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-muted">
        <li>
          <Who>Visiteurs du catalogue</Who> (demande de visite ou de réservation, sans compte) : nom, téléphone, email facultatif, dates et message saisis.
        </li>
        <li>
          <Who>Demandes de contact</Who> : nom, email, téléphone facultatif, organisation et message.
        </li>
        <li>
          <Who>Locataires</Who> : identité, coordonnées, pièce d&apos;identité, situation professionnelle et revenus déclarés, garant, historique des paiements,
          baux et demandes de maintenance.
        </li>
        <li>
          <Who>Propriétaires</Who> : identité, coordonnées, coordonnées bancaires pour le versement des loyers, biens confiés.
        </li>
      </ul>
      <H2>Finalités</H2>
      <P>
        Répondre aux demandes de visite, de réservation et de contact ; gérer les biens, les baux, les paiements et la maintenance ; produire les quittances et
        documents contractuels ; assurer la sécurité des accès. Aucune donnée n&apos;est vendue ni cédée à des tiers à des fins commerciales.
      </P>
      <H2>Qui accède aux données</H2>
      <P>
        L&apos;agence (selon les permissions accordées à chaque agent), chaque propriétaire pour ses seuls biens, chaque locataire pour son seul logement. Le nom
        du propriétaire d&apos;un bien n&apos;est jamais affiché dans le catalogue public.
      </P>
      <H2>Hébergement</H2>
      <P>Les données sont hébergées en Allemagne (Union européenne) par Render et Neon, prestataires techniques de l&apos;agence.</P>
      <H2>Cookies et stockage local</H2>
      <P>
        Le site n&apos;utilise ni publicité ni outil de mesure d&apos;audience. Seuls des éléments techniques sont déposés : le jeton de session et le rôle de
        l&apos;utilisateur connecté (cookies, supprimés à la déconnexion), la langue choisie (cookie, conservé un an), et les informations de session dans le
        stockage local du navigateur.
      </P>
      <H2>Durée de conservation</H2>
      <P>
        Les données liées à un bail ou à un paiement sont conservées pendant la relation contractuelle puis pendant les délais légaux applicables. Les demandes
        envoyées depuis le catalogue sont conservées le temps de leur traitement par l&apos;agence.
      </P>
      <H2>Vos droits</H2>
      <P>
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données auprès de l&apos;agence (coordonnées dans les{" "}
        <LegalLink>mentions légales</LegalLink>). En cas de difficulté, vous pouvez saisir l&apos;ARTCI.
      </P>
    </>
  );
}

export default async function PrivacyPage({ params }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-ink">
      <Body lang={toLang((await params).lang)} />
    </article>
  );
}
