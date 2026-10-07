import type { Metadata } from "next";
import { Lock, KeyRound, Eye, Database, FileCheck2, ShieldAlert, Server, History } from "lucide-react";

export const metadata: Metadata = {
  title: "Sécurité",
  description: "Comment IVOLOGIS protège les données des agences, des propriétaires et des locataires.",
};

const CONTROLS = [
  { icon: Lock, title: "Mots de passe chiffrés", text: "Les mots de passe ne sont jamais stockés en clair : ils sont hachés avec bcrypt (coût 12) avant enregistrement." },
  { icon: KeyRound, title: "Connexion protégée", text: "Jeton de session signé (JWT). Après 5 tentatives de connexion en une minute, l'accès est temporairement refusé pour bloquer les attaques par force brute." },
  { icon: Eye, title: "Accès par rôle", text: "Quatre rôles distincts : super-administrateur, agent (permissions accordées une à une), propriétaire et locataire. Chaque route vérifie le rôle côté serveur." },
  { icon: Database, title: "Isolation des données", text: "Un propriétaire ne voit que ses biens, contrats et paiements ; un locataire ne voit que son logement, son bail et ses quittances. Les identifiants d'autrui sont refusés." },
  { icon: History, title: "Journal d'activité", text: "Les actions sensibles (création d'agent, changement de statut ou de permissions, renouvellement, résiliation, archivage) sont enregistrées avec l'auteur et la date." },
  { icon: FileCheck2, title: "Documents maîtrisés", text: "Photos et documents n'acceptent que les formats prévus, avec une taille limitée. Les contrats et quittances sont générés à partir des données enregistrées." },
  { icon: Server, title: "Transport et en-têtes", text: "Échanges en HTTPS, en-têtes de sécurité (Helmet) et accès aux interfaces de programmation limité au domaine officiel de l'application." },
  { icon: ShieldAlert, title: "Réinitialisation sécurisée", text: "Le lien de réinitialisation du mot de passe expire au bout d'une heure et ne révèle jamais si un compte existe." },
];

const ROADMAP = [
  "Double authentification (code à usage unique) pour les comptes administrateurs.",
  "Expiration et révocation des sessions depuis l'espace administrateur.",
  "Sauvegardes automatiques chiffrées et procédure de restauration documentée.",
  "Envoi du lien de réinitialisation par email ou SMS, en remplacement du mode de test actuel.",
];

export default function SecurityPage() {
  return (
    <article className="mx-auto max-w-5xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Sécurité</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-primary-dark">Protéger les données de chacun.</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Les données locatives touchent à l&apos;intimité des personnes : identité, revenus, paiements. Voici les mesures actuellement en place, et ce qui reste à renforcer.
        </p>
      </header>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {CONTROLS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-ink">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-2xl bg-surface p-8">
        <h2 className="text-2xl font-bold text-primary-dark">Feuille de route sécurité</h2>
        <p className="mt-2 text-sm text-ink-muted">Ces points sont prévus et ne sont pas encore actifs.</p>
        <ul className="mt-5 space-y-3">
          {ROADMAP.map((r) => (
            <li key={r} className="flex items-start gap-3 text-sm text-ink">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {r}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        Signaler une vulnérabilité : écrivez-nous via la <a href="/#contact" className="font-semibold text-primary hover:underline">demande de démo</a> en précisant « sécurité » dans votre message.
      </p>
    </article>
  );
}
