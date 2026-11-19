import type { Metadata } from "next";
import { LegalPublisher } from "@/components/marketing/legal-identity";
import { toLang, type Lang } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-meta";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = toLang((await params).lang);
  return pageMetadata(lang, "/mentions-legales", lang === "en" ? "Legal notice" : "Mentions légales");
}

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-10 text-lg font-semibold">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-2 text-ink-muted">{children}</p>;

function Body({ lang }: { lang: Lang }) {
  if (lang === "en") {
    return (
      <>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Legal notice</h1>
        <p className="mt-2 text-xs text-ink-muted">Last updated: November 2026</p>
        <H2>Publisher</H2>
        <LegalPublisher lang={lang} />
        <H2>Hosting</H2>
        <P>Application hosted by Render (Frankfurt, Germany); PostgreSQL database hosted by Neon (Frankfurt, Germany).</P>
        <H2>Intellectual property</H2>
        <P>
          The platform&apos;s content (texts, interface) is protected. Payment operators&apos; logos belong to their respective brands and are shown for
          information only.
        </P>
        <H2>Liability</H2>
        <P>
          Generated documents (leases, receipts) reflect the information entered by the agency. Each user is responsible for checking their accuracy before
          signing.
        </P>
      </>
    );
  }
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight text-primary-dark">Mentions légales</h1>
      <p className="mt-2 text-xs text-ink-muted">Dernière mise à jour : novembre 2026</p>
      <H2>Éditeur</H2>
      <LegalPublisher lang={lang} />
      <H2>Hébergement</H2>
      <P>Application hébergée par Render (Francfort, Allemagne) ; base de données PostgreSQL hébergée par Neon (Francfort, Allemagne).</P>
      <H2>Propriété intellectuelle</H2>
      <P>
        Les éléments de la plateforme (textes, interface) sont protégés. Les logos des opérateurs de paiement appartiennent à leurs marques respectives et sont
        présentés à titre informatif.
      </P>
      <H2>Responsabilité</H2>
      <P>
        Les documents générés (baux, quittances) reflètent les informations saisies par l&apos;agence. Il appartient à chaque utilisateur de vérifier leur
        exactitude avant signature.
      </P>
    </>
  );
}

export default async function LegalPage({ params }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-ink">
      <Body lang={toLang((await params).lang)} />
    </article>
  );
}
