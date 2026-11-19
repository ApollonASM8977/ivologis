import type { Metadata } from "next";
import Link from "next/link";
import { toLang, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = toLang((await params).lang);
  return pageMetadata(lang, "/conditions-generales", lang === "en" ? "Terms of use" : "Conditions générales d'utilisation");
}

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-10 text-lg font-semibold">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-2 text-ink-muted">{children}</p>;
const A = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="font-semibold text-primary hover:underline">
    {children}
  </Link>
);

function Body({ lang }: { lang: Lang }) {
  if (lang === "en") {
    return (
      <>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Terms of use</h1>
        <p className="mt-2 text-xs text-ink-muted">Last updated: November 2026 · Draft to be validated by a lawyer before the commercial launch.</p>
        <H2>1. Purpose</H2>
        <P>
          These terms govern the use of the IVOLOGIS platform (website and client spaces): the public property catalogue, the agency&apos;s management tools, and
          the spaces of owners and tenants. Using the platform means accepting these terms.
        </P>
        <H2>2. Publisher</H2>
        <P>
          The platform is published by the agency identified in the <A href="/mentions-legales">legal notice</A>.
        </P>
        <H2>3. Accounts and access</H2>
        <P>
          Owner and tenant accounts are linked to their file with a single-use invitation code given by the agency. Each user keeps their credentials confidential
          and remains responsible for actions carried out with their account. Two-factor authentication is available and recommended. The agency may suspend an
          account in case of misuse.
        </P>
        <H2>4. Role of the agency</H2>
        <P>
          The agency is the single point of contact for owners, tenants and visitors: viewing and booking requests, payments, repairs and contracts go through it.
          Listings are published and checked by the agency; demo listings are marked as such and accept no request.
        </P>
        <H2>5. Catalogue, viewings and bookings</H2>
        <P>
          A viewing or booking request is not a commitment: it is confirmed in writing by the agency. Never pay anything before this confirmation, and only to the
          agency, against a receipt. Payment is not online: terms are given upon confirmation.
        </P>
        <H2>6. Rent and payments</H2>
        <P>
          A tenant who pays by Mobile Money or transfer declares the transaction in their space; the receipt is issued only after the agency has checked the
          payment. Amounts and contract terms are those of the signed lease.
        </P>
        <H2>7. User obligations</H2>
        <P>
          Users undertake to provide accurate information, not to use the platform for fraudulent or unlawful purposes, not to attempt to access other users&apos;
          data, and not to disrupt the service (automated requests, intrusion attempts).
        </P>
        <H2>8. Personal data</H2>
        <P>
          Personal data is processed as described in the <A href="/confidentialite">privacy policy</A>.
        </P>
        <H2>9. Intellectual property</H2>
        <P>The platform (texts, interface, software) is protected. Any reproduction without authorisation is prohibited.</P>
        <H2>10. Liability</H2>
        <P>
          The platform is provided with care, without a guarantee of uninterrupted availability. Generated documents (contracts, receipts, statements) reflect the
          information entered: each user checks it before signing or using it. The English version of a contract is a translation; the French version prevails.
        </P>
        <H2>11. Changes</H2>
        <P>These terms may change; the applicable version is the one published on this page.</P>
        <H2>12. Applicable law</H2>
        <P>These terms are governed by the law of Côte d&apos;Ivoire. Any dispute falls under the jurisdiction of the courts of Abidjan.</P>
      </>
    );
  }
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Conditions générales d&apos;utilisation</h1>
      <p className="mt-2 text-xs text-ink-muted">Dernière mise à jour : novembre 2026 · Projet à faire valider par un juriste avant le lancement commercial.</p>
      <H2>1. Objet</H2>
      <P>
        Les présentes conditions encadrent l&apos;utilisation de la plateforme IVOLOGIS (site et espaces clients) : le catalogue public de biens, les outils de
        gestion de l&apos;agence et les espaces des propriétaires et des locataires. Utiliser la plateforme vaut acceptation de ces conditions.
      </P>
      <H2>2. Éditeur</H2>
      <P>
        La plateforme est éditée par l&apos;agence identifiée dans les <A href="/mentions-legales">mentions légales</A>.
      </P>
      <H2>3. Comptes et accès</H2>
      <P>
        Les comptes des propriétaires et des locataires sont rattachés à leur dossier par un code d&apos;invitation à usage unique remis par l&apos;agence.
        Chaque utilisateur garde ses identifiants confidentiels et reste responsable des actions faites avec son compte. La double authentification est
        disponible et recommandée. L&apos;agence peut suspendre un compte en cas d&apos;usage abusif.
      </P>
      <H2>4. Rôle de l&apos;agence</H2>
      <P>
        L&apos;agence est l&apos;interlocuteur unique des propriétaires, des locataires et des visiteurs : demandes de visite et de réservation, paiements,
        travaux et contrats passent par elle. Les annonces sont publiées et vérifiées par l&apos;agence ; les annonces de démonstration sont signalées et
        n&apos;acceptent aucune demande.
      </P>
      <H2>5. Catalogue, visites et réservations</H2>
      <P>
        Une demande de visite ou de réservation n&apos;engage à rien : elle est confirmée par écrit par l&apos;agence. Ne versez rien avant cette confirmation,
        et uniquement à l&apos;agence, contre reçu. Le paiement n&apos;est pas en ligne : les modalités sont communiquées à la confirmation.
      </P>
      <H2>6. Loyers et paiements</H2>
      <P>
        Le locataire qui paie par Mobile Money ou virement déclare la transaction dans son espace ; la quittance n&apos;est émise qu&apos;après vérification du
        paiement par l&apos;agence. Les montants et conditions sont ceux du bail signé.
      </P>
      <H2>7. Obligations des utilisateurs</H2>
      <P>
        Les utilisateurs s&apos;engagent à fournir des informations exactes, à ne pas utiliser la plateforme à des fins frauduleuses ou illicites, à ne pas
        tenter d&apos;accéder aux données d&apos;autrui et à ne pas perturber le service (requêtes automatisées, tentatives d&apos;intrusion).
      </P>
      <H2>8. Données personnelles</H2>
      <P>
        Les données personnelles sont traitées comme décrit dans la <A href="/confidentialite">politique de confidentialité</A>.
      </P>
      <H2>9. Propriété intellectuelle</H2>
      <P>La plateforme (textes, interface, logiciel) est protégée. Toute reproduction sans autorisation est interdite.</P>
      <H2>10. Responsabilité</H2>
      <P>
        La plateforme est fournie avec soin, sans garantie de disponibilité ininterrompue. Les documents générés (contrats, quittances, relevés) reflètent les
        informations saisies : chaque utilisateur les vérifie avant de les signer ou de les utiliser. La version anglaise d&apos;un contrat est une traduction ;
        la version française prévaut.
      </P>
      <H2>11. Modifications</H2>
      <P>Ces conditions peuvent évoluer ; la version applicable est celle publiée sur cette page.</P>
      <H2>12. Droit applicable</H2>
      <P>Les présentes conditions sont régies par le droit ivoirien. Tout litige relève des juridictions d&apos;Abidjan.</P>
    </>
  );
}

export default async function TermsPage({ params }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-ink">
      <Body lang={toLang((await params).lang)} />
    </article>
  );
}
