import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2, Home, EyeOff, FlaskConical, ShieldAlert, Wallet, Landmark, Scale } from "lucide-react";
import { toLang, type Messages } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

// Mêmes positions que `checks` et `tips` ci-dessous.
const CHECK_ICONS = [FileCheck2, Home, EyeOff, FlaskConical];
const TIP_ICONS = [ShieldAlert, Wallet, Scale, Landmark, ShieldAlert];

const fr = {
  metaTitle: "Comment nous vérifions les annonces",
  metaDescription: "Ce que l'agence contrôle avant de publier un bien, et les réflexes pour éviter les arnaques immobilières en Côte d'Ivoire.",
  eyebrow: "Confiance",
  title: "Comment nous vérifions les annonces",
  lead: "Faux propriétaires, terrains vendus deux fois, avances encaissées puis plus de nouvelles : voici ce que nous contrôlons avant de publier, et les réflexes qui vous protègent.",
  checks: [
    {
      title: "Biens à vendre : document foncier contrôlé",
      text: "Un bien à vendre n'apparaît dans le catalogue qu'après contrôle par l'agence de son document foncier (ACD, titre foncier ou équivalent). Le propriétaire ne peut pas cocher cette vérification lui-même.",
    },
    {
      title: "Résidences meublées : publication validée",
      text: "Une résidence en courte durée n'est publiée qu'après validation par l'agence. Si le propriétaire modifie l'annonce, elle repasse en attente jusqu'à une nouvelle validation.",
    },
    {
      title: "L'agence reste votre seul interlocuteur",
      text: "Le nom et les coordonnées du propriétaire ne sont jamais publiés. Les demandes de visite, de réservation, les appels et les messages WhatsApp arrivent à l'agence.",
    },
    {
      title: "Les exemples sont signalés",
      text: "Les annonces de démonstration portent un bandeau « Démo » : elles montrent le fonctionnement du site, ne correspondent à aucun bien réel et n'acceptent aucune demande.",
    },
  ],
  tipsTitle: "Vos réflexes anti-arnaque",
  tips: [
    "Ne versez jamais d'argent avant d'avoir visité le bien et vu les documents originaux.",
    "Payez uniquement l'agence, contre un reçu. Jamais un démarcheur, un « cousin du propriétaire » ou un numéro inconnu.",
    "Location d'un logement : la caution et l'avance sont plafonnées à 2 mois de loyer chacune (Code de la construction et de l'habitat, loi n° 2019-576). Les frais d'agence sont d'un mois de loyer hors taxes, partagés à parts égales entre bailleur et locataire (décret n° 2024-1115 du 19 décembre 2024).",
    "Achat d'un terrain : faites vérifier le titre auprès de la Conservation foncière, passez par un notaire et faites borner le terrain par un géomètre-expert.",
    "Méfiez-vous des prix très bas et de l'urgence (« d'autres clients attendent ») : ce sont les leviers classiques des arnaques. Le ministère de la Construction a d'ailleurs alerté en août 2025 sur des programmes immobiliers illégaux dans le Grand Abidjan.",
  ],
  disclaimer: "Ces informations sont générales et ne remplacent pas le conseil d'un notaire ou d'un avocat.",
  suspicious: "Une annonce vous semble suspecte ?",
  report: "Signalez-la à l'agence",
};

const MESSAGES: Messages<typeof fr> = {
  fr,
  en: {
    metaTitle: "How we verify listings",
    metaDescription: "What the agency checks before publishing a property, and how to avoid property scams in Côte d'Ivoire.",
    eyebrow: "Trust",
    title: "How we verify listings",
    lead: "Fake owners, land sold twice, advances paid and then silence: here is what we check before publishing, and the habits that protect you.",
    checks: [
      {
        title: "Property for sale: land document checked",
        text: "A property for sale only appears in the catalogue once the agency has checked its land document (ACD, land title or equivalent). Owners cannot tick this check themselves.",
      },
      {
        title: "Furnished residences: publication approved",
        text: "A short-stay residence is only published after the agency approves it. If the owner edits the listing, it goes back to pending until it is approved again.",
      },
      {
        title: "The agency is your only contact",
        text: "The owner's name and contact details are never published. Viewing and booking requests, calls and WhatsApp messages all go to the agency.",
      },
      {
        title: "Examples are clearly marked",
        text: "Demo listings carry a “Demo” banner: they show how the site works, match no real property and accept no requests.",
      },
    ],
    tipsTitle: "Your anti-scam habits",
    tips: [
      "Never pay any money before visiting the property and seeing the original documents.",
      "Only pay the agency, against a receipt. Never a canvasser, an “owner's cousin” or an unknown number.",
      "Renting a home: the deposit and the advance are each capped at 2 months' rent (Construction and Housing Code, Law No. 2019-576). Agency fees are one month's rent excluding tax, split equally between landlord and tenant (Decree No. 2024-1115 of 19 December 2024).",
      "Buying land: have the title checked at the Land Registry (Conservation foncière), use a notary and have the plot surveyed by a chartered surveyor.",
      "Beware of very low prices and urgency (“other clients are waiting”): these are classic scam levers. The Ministry of Construction warned in August 2025 about illegal property developments in Greater Abidjan.",
    ],
    disclaimer: "This information is general and does not replace advice from a notary or a lawyer.",
    suspicious: "Does a listing look suspicious?",
    report: "Report it to the agency",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = MESSAGES[toLang((await params).lang)];
  return { title: m.metaTitle, description: m.metaDescription };
}

export default async function VerificationPage({ params }: Props) {
  const m = MESSAGES[toLang((await params).lang)];
  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-primary-dark">{m.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">{m.lead}</p>
      </header>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {m.checks.map((c, i) => {
          const Icon = CHECK_ICONS[i];
          return (
            <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-ink">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-14 rounded-2xl bg-surface p-8">
        <h2 className="text-2xl font-bold text-primary-dark">{m.tipsTitle}</h2>
        <ul className="mt-5 space-y-4">
          {m.tips.map((text, i) => {
            const Icon = TIP_ICONS[i];
            return (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                {text}
              </li>
            );
          })}
        </ul>
        <p className="mt-6 text-xs text-ink-muted">{m.disclaimer}</p>
      </section>

      <p className="mt-10 text-sm text-ink-muted">
        {m.suspicious}{" "}
        <Link href="/#contact" className="font-semibold text-primary hover:underline">
          {m.report}
        </Link>
        .
      </p>
    </article>
  );
}
