import type { Metadata } from "next";
import { Lock, KeyRound, Eye, Database, FileCheck2, ShieldAlert, Server, History } from "lucide-react";
import { toLang, type Messages } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

// Mêmes positions que les textes de `controls` ci-dessous.
const ICONS = [Lock, KeyRound, Eye, Eye, Database, History, FileCheck2, Server, ShieldAlert];

const fr = {
  metaTitle: "Sécurité",
  metaDescription: "Comment IVOLOGIS protège les données des agences, des propriétaires et des locataires.",
  eyebrow: "Sécurité",
  title: "Protéger les données de chacun.",
  lead: "Les données locatives touchent à l'intimité des personnes : identité, revenus, paiements. Voici les mesures actuellement en place, et ce qui reste à renforcer.",
  controls: [
    { title: "Mots de passe hachés", text: "Les mots de passe ne sont jamais stockés en clair : ils sont hachés avec bcrypt (coût 12) avant enregistrement." },
    { title: "Connexion protégée", text: "Jeton de session signé (JWT), sessions révocables, double authentification (application d'authentification) activable par chaque utilisateur. Après 5 tentatives de connexion en une minute, l'accès est temporairement refusé." },
    { title: "Comptes rattachés sur invitation", text: "Un compte en ligne n'est relié au dossier d'un locataire ou d'un propriétaire qu'avec un code d'invitation à usage unique remis par l'agence, jamais sur simple numéro de téléphone." },
    { title: "Accès par rôle", text: "Quatre rôles distincts : super-administrateur, agent (permissions accordées une à une), propriétaire et locataire. Chaque route vérifie le rôle côté serveur." },
    { title: "Isolation des données", text: "Un propriétaire ne voit que ses biens, contrats et paiements ; un locataire ne voit que son logement, son bail et ses quittances. Les identifiants d'autrui sont refusés." },
    { title: "Journal d'activité", text: "Les actions sensibles (création d'agent, changement de statut ou de permissions, renouvellement, résiliation, archivage) sont enregistrées avec l'auteur et la date." },
    { title: "Documents maîtrisés", text: "Photos et documents n'acceptent que les formats prévus, avec une taille limitée. Les contrats et quittances sont générés à partir des données enregistrées." },
    { title: "Transport et en-têtes", text: "Échanges en HTTPS, en-têtes de sécurité (Helmet) et accès aux interfaces de programmation limité au domaine officiel de l'application." },
    { title: "Réinitialisation sécurisée", text: "Le lien de réinitialisation du mot de passe expire au bout d'une heure, ne sert qu'une fois et ne révèle jamais si un compte existe." },
  ],
  roadmapTitle: "Feuille de route sécurité",
  roadmapLead: "Ces points sont prévus et ne sont pas encore actifs.",
  roadmap: [
    "Double authentification obligatoire pour les comptes de l'agence.",
    "Export quotidien de la base vers un stockage chiffré, avec test de restauration mensuel.",
    "Envoi du lien de réinitialisation par email ou SMS (aujourd'hui, la réinitialisation passe par l'agence).",
  ],
  report: "Signaler une vulnérabilité : écrivez-nous via la",
  reportLink: "demande de démo",
  reportEnd: "en précisant « sécurité » dans votre message.",
};

const MESSAGES: Messages<typeof fr> = {
  fr,
  en: {
    metaTitle: "Security",
    metaDescription: "How IVOLOGIS protects the data of agencies, owners and tenants.",
    eyebrow: "Security",
    title: "Protecting everyone's data.",
    lead: "Rental data touches on people's privacy: identity, income, payments. Here are the measures currently in place, and what remains to be strengthened.",
    controls: [
      { title: "Hashed passwords", text: "Passwords are never stored in plain text: they are hashed with bcrypt (cost 12) before being saved." },
      { title: "Protected sign-in", text: "Signed session token (JWT), revocable sessions, two-factor authentication (authenticator app) that each user can enable. After 5 sign-in attempts within a minute, access is temporarily refused." },
      { title: "Accounts linked by invitation", text: "An online account is only linked to a tenant's or owner's file with a single-use invitation code given by the agency, never on a phone number alone." },
      { title: "Role-based access", text: "Four separate roles: super administrator, agent (permissions granted one by one), owner and tenant. Every route checks the role on the server." },
      { title: "Data isolation", text: "An owner only sees their own properties, contracts and payments; a tenant only sees their own home, lease and receipts. Other people's identifiers are refused." },
      { title: "Activity log", text: "Sensitive actions (creating an agent, changing a status or permissions, renewal, termination, archiving) are recorded with their author and date." },
      { title: "Controlled documents", text: "Photos and documents only accept the expected formats, with a size limit. Contracts and receipts are generated from the recorded data." },
      { title: "Transport and headers", text: "HTTPS connections, security headers (Helmet) and programming interfaces restricted to the application's official domain." },
      { title: "Secure password reset", text: "The password reset link expires after one hour, can only be used once and never reveals whether an account exists." },
    ],
    roadmapTitle: "Security roadmap",
    roadmapLead: "These items are planned and not active yet.",
    roadmap: [
      "Mandatory two-factor authentication for agency accounts.",
      "Daily database export to encrypted storage, with a monthly restore test.",
      "Reset link sent by email or SMS (today, password resets go through the agency).",
    ],
    report: "Report a vulnerability: write to us through the",
    reportLink: "demo request form",
    reportEnd: "and mention “security” in your message.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = MESSAGES[toLang((await params).lang)];
  return { title: m.metaTitle, description: m.metaDescription };
}

export default async function SecurityPage({ params }: Props) {
  const m = MESSAGES[toLang((await params).lang)];
  return (
    <article className="mx-auto max-w-5xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-primary-dark">{m.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{m.lead}</p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {m.controls.map((c, i) => {
          const Icon = ICONS[i];
          return (
            <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.text}</p>
            </div>
          );
        })}
      </div>

      <section className="mt-16 rounded-2xl bg-surface p-8">
        <h2 className="text-2xl font-bold text-primary-dark">{m.roadmapTitle}</h2>
        <p className="mt-2 text-sm text-ink-muted">{m.roadmapLead}</p>
        <ul className="mt-5 space-y-3">
          {m.roadmap.map((r) => (
            <li key={r} className="flex items-start gap-3 text-sm text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        {m.report}{" "}
        <a href="/#contact" className="font-semibold text-primary hover:underline">
          {m.reportLink}
        </a>{" "}
        {m.reportEnd}
      </p>
    </article>
  );
}
