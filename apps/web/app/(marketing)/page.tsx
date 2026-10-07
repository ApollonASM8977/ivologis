"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
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
  Sparkles,
} from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { SpotlightCard } from "@/components/marketing/spotlight-card";
import { LogoMarquee } from "@/components/marketing/logo-marquee";
import { useSlowConnection } from "@/lib/use-slow-connection";

const FEATURES = [
  { icon: Building2, title: "Biens immobiliers", text: "Fiche complète : adresse précise, photos, étage, équipements, meublé, repère pour trouver le bien." },
  { icon: Users, title: "Locataires et baux", text: "Dossier locataire avec garant et revenus, baux d'habitation, commercial, professionnel ou terrain, prêts à signer." },
  { icon: Wallet, title: "Loyers et paiements", text: "Suivi des loyers, retards, rappels automatiques, quittances PDF générées à chaque paiement." },
  { icon: Wrench, title: "Maintenance", text: "Demandes signalées par les locataires, assignation à un technicien, coûts estimés et réels, fil de commentaires." },
  { icon: BarChart3, title: "Relevés propriétaires", text: "Synthèse des revenus, commission et dépenses, exportable en PDF ou CSV compatible Excel." },
  { icon: FileText, title: "Documents", text: "Contrats et quittances exportables en PDF et Word, avec les informations de votre agence." },
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
    items: ["Quittances et contrat à portée de main", "Signalement de panne avec photos", "Paiement du loyer en quelques clics"],
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
    a: "Les mots de passe sont chiffrés, chaque propriétaire et chaque locataire n'accède qu'à ses propres données, et les actions sensibles sont tracées dans un journal. La double authentification est disponible. Le détail est sur la page Sécurité.",
  },
  {
    q: "Les locataires peuvent-ils payer leur loyer en ligne ?",
    a: "L'interface de paiement mobile money (Orange Money, MTN MoMo, Moov Money, Wave) est en place. L'encaissement réel auprès des opérateurs est en cours de finalisation : d'ici là, les paiements sont enregistrés par votre agence.",
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

function HeroBlobs({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        animate={reduced ? undefined : { x: [0, 40, -20, 0], y: [0, 30, 10, 0], scale: [1, 1.08, 0.97, 1] }}
        transition={reduced ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl"
      />
      <motion.div
        animate={reduced ? undefined : { x: [0, -50, 20, 0], y: [0, -20, 30, 0] }}
        transition={reduced ? undefined : { duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl"
      />
    </div>
  );
}

function DashboardMockup() {
  const bars = [42, 58, 49, 71, 66, 84];
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springX = useSpring(rx, { stiffness: 150, damping: 18 });
  const springY = useSpring(ry, { stiffness: 150, damping: 18 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    rx.set((e.clientX - r.left) / r.width - 0.5);
    ry.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <div className="[perspective:1200px]" onMouseMove={onMove} onMouseLeave={() => { rx.set(0); ry.set(0); }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX, rotateY }}
        className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-primary/15"
        aria-hidden="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Vue d&apos;ensemble</p>
          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-800">À jour</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Biens", value: "24" },
            { label: "Loyers encaissés", value: "9,4 M" },
            { label: "Retards", value: "3" },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-xl bg-surface p-3"
            >
              <p className="text-[11px] text-ink-muted">{k.label}</p>
              <p className="mt-1 text-lg font-bold text-ink">{k.value}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 flex h-28 items-end gap-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.07, ease: "easeOut" }}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-primary/60"
            />
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {["Quittance émise · Villa Riviera 3", "Demande de maintenance · Plomberie", "Bail renouvelé · Studio Angré"].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.12 }}
              className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-xs text-ink-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
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
  const slowConnection = useSlowConnection();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
        <HeroBlobs reduced={slowConnection} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> Conçu pour la location en Côte d&apos;Ivoire
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-primary-dark sm:text-5xl lg:text-6xl"
            >
              La gestion locative,{" "}
              <motion.span
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-r from-primary via-sky-500 to-primary bg-[length:200%_auto] bg-clip-text text-transparent"
              >
                simple et sécurisée.
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted"
            >
              Biens, locataires, baux, loyers, travaux et relevés propriétaires réunis dans une seule plateforme, pour les agences, les propriétaires et leurs locataires.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="#contact" className="group relative overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5">
                <span className="relative z-10">Demander une démo</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link href="/securite" className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary/40 hover:text-primary">
                Voir la sécurité
              </Link>
            </motion.div>
          </div>
          <DashboardMockup />
        </div>
      </section>

      <section aria-labelledby="paiements-titre" className="border-y border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p id="paiements-titre" className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Moyens de paiement mobile money
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
                  {t.highlight && (
                    <motion.span
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="mb-3 w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white"
                    >
                      Le plus choisi
                    </motion.span>
                  )}
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
            <p className="mt-4 text-ink-muted">Accès par rôle, isolation stricte entre propriétaires et locataires, mots de passe chiffrés, double authentification et journal des actions sensibles.</p>
            <Link href="/securite" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Lire la page sécurité →
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
            {[
              { icon: Lock, label: "Mots de passe chiffrés" },
              { icon: KeyRound, label: "Double authentification" },
              { icon: Eye, label: "Accès par rôle" },
              { icon: History, label: "Journal d'activité" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4, boxShadow: "0 12px 30px -10px rgba(11,95,255,0.25)" }}
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
