import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2, Home, EyeOff, FlaskConical, ShieldAlert, Wallet, Landmark, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Comment nous vérifions les annonces",
  description: "Ce que l'agence contrôle avant de publier un bien, et les réflexes pour éviter les arnaques immobilières en Côte d'Ivoire.",
};

const CHECKS = [
  {
    icon: FileCheck2,
    title: "Biens à vendre : document foncier contrôlé",
    text: "Un bien à vendre n'apparaît dans le catalogue qu'après contrôle par l'agence de son document foncier (ACD, titre foncier ou équivalent). Le propriétaire ne peut pas cocher cette vérification lui-même.",
  },
  {
    icon: Home,
    title: "Résidences meublées : publication validée",
    text: "Une résidence en courte durée n'est publiée qu'après validation par l'agence. Si le propriétaire modifie l'annonce, elle repasse en attente jusqu'à une nouvelle validation.",
  },
  {
    icon: EyeOff,
    title: "L'agence reste votre seul interlocuteur",
    text: "Le nom et les coordonnées du propriétaire ne sont jamais publiés. Les demandes de visite, de réservation, les appels et les messages WhatsApp arrivent à l'agence.",
  },
  {
    icon: FlaskConical,
    title: "Les exemples sont signalés",
    text: "Les annonces de démonstration portent un bandeau « Démo » : elles montrent le fonctionnement du site, ne correspondent à aucun bien réel et n'acceptent aucune demande.",
  },
];

const TIPS = [
  { icon: ShieldAlert, text: "Ne versez jamais d'argent avant d'avoir visité le bien et vu les documents originaux." },
  { icon: Wallet, text: "Payez uniquement l'agence, contre un reçu. Jamais un démarcheur, un « cousin du propriétaire » ou un numéro inconnu." },
  {
    icon: Scale,
    text: "Location d'un logement : la caution et l'avance sont plafonnées à 2 mois de loyer chacune (Code de la construction et de l'habitat, loi n° 2019-576). Les frais d'agence sont d'un mois de loyer hors taxes, partagés à parts égales entre bailleur et locataire (décret n° 2024-1115 du 19 décembre 2024).",
  },
  {
    icon: Landmark,
    text: "Achat d'un terrain : faites vérifier le titre auprès de la Conservation foncière, passez par un notaire et faites borner le terrain par un géomètre-expert.",
  },
  {
    icon: ShieldAlert,
    text: "Méfiez-vous des prix très bas et de l'urgence (« d'autres clients attendent ») : ce sont les leviers classiques des arnaques. Le ministère de la Construction a d'ailleurs alerté en août 2025 sur des programmes immobiliers illégaux dans le Grand Abidjan.",
  },
];

export default function VerificationPage() {
  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Confiance</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-primary-dark">Comment nous vérifions les annonces</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Faux propriétaires, terrains vendus deux fois, avances encaissées puis plus de nouvelles : voici ce que nous contrôlons avant de publier, et les
          réflexes qui vous protègent.
        </p>
      </header>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {CHECKS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <c.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-ink">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 rounded-2xl bg-surface p-8">
        <h2 className="text-2xl font-bold text-primary-dark">Vos réflexes anti-arnaque</h2>
        <ul className="mt-5 space-y-4">
          {TIPS.map((t) => (
            <li key={t.text} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
              <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
              {t.text}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-ink-muted">Ces informations sont générales et ne remplacent pas le conseil d&apos;un notaire ou d&apos;un avocat.</p>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        Une annonce vous semble suspecte ?{" "}
        <Link href="/#contact" className="font-semibold text-primary hover:underline">
          Signalez-la à l&apos;agence
        </Link>
        .
      </p>
    </article>
  );
}
