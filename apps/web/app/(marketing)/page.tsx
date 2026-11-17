"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Users,
  Wallet,
  Wrench,
  BarChart3,
  FileText,
  ShieldCheck,
  ChevronDown,
  Check,
  Lock,
  KeyRound,
  Eye,
  History,
  Tag,
  CalendarRange,
  ArrowRight,
} from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { HeroSearch } from "@/components/marketing/hero-search";
import { SpotlightCard } from "@/components/marketing/spotlight-card";
import { LogoMarquee } from "@/components/marketing/logo-marquee";

const FEATURES = [
  { icon: Building2, title: "Biens immobiliers", text: "Fiche complète : adresse précise, photos, étage, équipements, meublé, repère pour trouver le bien." },
  { icon: Users, title: "Locataires et baux", text: "Dossier locataire avec garant et revenus, baux d'habitation, commercial, professionnel ou terrain, prêts à signer." },
  { icon: Wallet, title: "Loyers et paiements", text: "Suivi des loyers et des retards, relance des impayés, quittance PDF émise dès qu'un paiement est confirmé." },
  { icon: Wrench, title: "Maintenance", text: "Demandes signalées par les locataires, assignation à un technicien, coûts estimés et réels, fil de commentaires." },
  { icon: BarChart3, title: "Relevés propriétaires", text: "Synthèse des revenus, commission et dépenses, exportable en PDF ou CSV compatible Excel." },
  { icon: FileText, title: "Documents", text: "Contrats et quittances exportables en PDF et Word, avec les informations de votre agence." },
];

const CATALOG_OFFERS = [
  { href: "/catalogue/locations", icon: KeyRound, title: "Logements à louer", text: "Studios, appartements, villas au mois : loyer, avance et caution affichés, frais d'agence encadrés. Demandez une visite sans créer de compte." },
  { href: "/catalogue/sales", icon: Tag, title: "Biens à vendre", text: "Terrains, villas, appartements et locaux, publiés après contrôle du document foncier. Demandez un rendez-vous de visite en un clic." },
  { href: "/catalogue/short-stay", icon: CalendarRange, title: "Résidences meublées", text: "Réservez un séjour à la nuitée, façon Airbnb simplifié : choisissez vos dates, envoyez votre demande, le paiement se règle sur place ou avant l'arrivée." },
];

const STEPS = [
  { n: "01", title: "Créez votre parc", text: "Ajoutez vos propriétaires et leurs biens, avec photos et caractéristiques." },
  { n: "02", title: "Associez baux et locataires", text: "Choisissez le type de bail : les champs utiles apparaissent automatiquement." },
  { n: "03", title: "Pilotez au quotidien", text: "Loyers, travaux et documents suivis au même endroit, pour tous les acteurs." },
];

const AUDIENCES = [
  {
    key: "agence",
    label: "Agences",
    title: "Agences immobilières",
    intro: "Une équipe, des permissions précises et une vue claire sur tous les loyers.",
    items: ["Gestion multi-agents avec permissions précises", "Journal d'activité des actions sensibles", "Vue d'ensemble des loyers en retard"],
  },
  {
    key: "proprietaire",
    label: "Propriétaires",
    title: "Propriétaires",
    intro: "Suivez vos biens depuis un espace dédié, sans dépendre de l'agence pour chaque information.",
    items: ["Espace dédié, accès limité à vos seuls biens", "Relevé financier et suivi des travaux", "Contrats et quittances téléchargeables"],
  },
  {
    key: "locataire",
    label: "Locataires",
    title: "Locataires",
    intro: "Votre logement, votre bail et vos quittances, accessibles à tout moment.",
    items: ["Quittances et contrat à portée de main", "Signalement de panne avec photos", "Déclaration de paiement suivie par l'agence"],
  },
];

const TIERS = [
  { name: "Démarrage", size: "1 à 10 biens", items: ["Toutes les fonctionnalités", "Documents PDF et Word", "Espace propriétaire et locataire"] },
  { name: "Croissance", size: "11 à 50 biens", items: ["Tout Démarrage", "Équipe avec permissions", "Relevés et exports avancés"], highlight: true },
  { name: "Entreprise", size: "Plus de 50 biens", items: ["Tout Croissance", "Accompagnement à la mise en place", "Adaptations sur mesure"] },
];

const FAQ = [
  {
    q: "Mes données sont-elles protégées ?",
    a: "Les mots de passe sont stockés sous forme hachée, chaque propriétaire et chaque locataire n'accède qu'à ses propres données, et les actions sensibles sont tracées dans un journal. La double authentification est disponible. Le détail est sur la page Sécurité.",
  },
  {
    q: "Les locataires peuvent-ils payer leur loyer en ligne ?",
    a: "Pas encore directement. Le locataire paie par Orange Money, MTN MoMo, Moov Money ou Wave au numéro de l'agence, puis déclare la transaction dans son espace. L'agence la vérifie et la quittance est émise automatiquement. Le paiement en ligne direct est prévu.",
  },
  {
    q: "Puis-je exporter mes relevés et mes documents ?",
    a: "Oui. Les relevés propriétaires se téléchargent en PDF ou en CSV (compatible Excel), et les contrats et quittances en PDF ou Word.",
  },
  {
    q: "Mes propriétaires ont-ils un accès ?",
    a: "Oui, chaque propriétaire dispose d'un espace dédié pour suivre ses biens, ses paiements, ses contrats et ses demandes de maintenance.",
  },
  {
    q: "Comment démarrer ?",
    a: "Demandez une démo : nous échangeons sur la taille de votre parc, puis nous vous accompagnons pour importer vos biens et vos baux.",
  },
];

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-ink hover:text-primary"
        >
          {q}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="h-5 w-5 text-ink-muted" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-ink-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [audience, setAudience] = useState(0);
  const active = AUDIENCES[audience];

  return (
    <>
      <HeroSearch />

      <section id="catalogue" className="scroll-mt-20 border-y border-gray-100 bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Catalogue public</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Vous cherchez un bien ou un séjour ?</h2>
            <p className="mt-3 text-ink-muted">Parcourez nos annonces sans créer de compte : logements à louer, terrains et biens à vendre, résidences meublées à la nuitée.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG_OFFERS.map((o, i) => (
              <Reveal key={o.title} delay={i * 0.08}>
                <Link href={o.href} className="group block h-full rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <o.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{o.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{o.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Voir les annonces <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="paiements-titre" className="border-y border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p id="paiements-titre" className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Moyens de paiement acceptés par l&apos;agence
          </p>
          <LogoMarquee />
        </div>
      </section>

      <section id="fonctionnalites" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Fonctionnalités</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Tout le cycle locatif, sans tableur.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <SpotlightCard className="h-full">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.text}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Comment ça marche</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Trois étapes pour démarrer.</h2>
          </Reveal>
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 origin-left bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block"
            />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.15}>
                <div className="relative rounded-2xl bg-white p-7 shadow-sm">
                  <motion.span
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.2 + i * 0.2 }}
                    className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-black text-white shadow-lg shadow-primary/30"
                  >
                    {s.n}
                  </motion.span>
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pour-qui" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pour qui</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Chacun voit ce qui le concerne, et seulement cela.</h2>
          </Reveal>

          <div role="tablist" aria-label="Profils" className="mt-10 flex flex-wrap gap-2 border-b border-gray-200">
            {AUDIENCES.map((a, i) => (
              <button
                key={a.key}
                role="tab"
                aria-selected={audience === i}
                aria-controls={`panel-${a.key}`}
                onClick={() => setAudience(i)}
                className={`relative px-4 pb-3 pt-2 text-sm font-semibold transition-colors ${audience === i ? "text-primary" : "text-ink-muted hover:text-ink"}`}
              >
                {a.label}
                {audience === i && (
                  <motion.span
                    layoutId="audience-indicator"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              id={`panel-${active.key}`}
              role="tabpanel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-8 grid items-center gap-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:grid-cols-2"
            >
              <div>
                <h3 className="text-2xl font-bold text-ink">{active.title}</h3>
                <p className="mt-2 text-ink-muted">{active.intro}</p>
              </div>
              <ul className="space-y-3">
                {active.items.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-2.5 text-sm text-ink"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                      <Check className="h-3.5 w-3.5 text-success" />
                    </span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-20 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Tarifs</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Une formule adaptée à la taille de votre parc.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">Les tarifs sont communiqués après une démo, selon le nombre de biens et vos besoins.</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TIERS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex h-full flex-col rounded-2xl bg-white p-7 ${t.highlight ? "ring-2 ring-primary shadow-xl shadow-primary/15" : "border border-gray-100 shadow-sm"}`}
                >
                  <h3 className="text-xl font-bold text-ink">{t.name}</h3>
                  <p className="text-sm text-ink-muted">{t.size}</p>
                  <p className="mt-4 text-2xl font-extrabold text-primary-dark">Sur devis</p>
                  <ul className="mt-5 flex-1 space-y-3">
                    {t.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="#contact" className={`mt-7 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors ${t.highlight ? "bg-primary text-white hover:bg-primary/90" : "border border-gray-200 text-ink hover:border-primary/40 hover:text-primary"}`}>
                    Demander un devis
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Sécurité</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Vos données restent à leur place.</h2>
            <p className="mt-4 text-ink-muted">Accès par rôle, isolation stricte entre propriétaires et locataires, mots de passe hachés, double authentification et journal des actions sensibles.</p>
            <Link href="/securite" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Lire la page sécurité →
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
            {[
              { icon: Lock, label: "Mots de passe hachés" },
              { icon: KeyRound, label: "Double authentification" },
              { icon: Eye, label: "Accès par rôle" },
              { icon: History, label: "Journal d'activité" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(11,85,99,0.25)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.03 }}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5"
              >
                <s.icon className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-ink">{s.label}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-surface py-20">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Questions fréquentes</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Vos questions, nos réponses.</h2>
          </Reveal>
          <div className="mt-10 rounded-2xl bg-white px-6 shadow-sm">
            {FAQ.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Demande de démo</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">Parlons de votre parc.</h2>
            <p className="mt-4 text-ink-muted">Décrivez votre activité en quelques lignes. Nous revenons vers vous pour une démonstration adaptée à vos biens.</p>
            <p className="mt-6 text-sm text-ink-muted">Déjà client ? <Link href="/login" className="font-semibold text-primary hover:underline">Connectez-vous à votre espace</Link>.</p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8 lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
