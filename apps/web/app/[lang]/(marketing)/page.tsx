import Link from "next/link";
import {
  Building2,
  Users,
  Wallet,
  Wrench,
  BarChart3,
  FileText,
  Check,
  Lock,
  KeyRound,
  Eye,
  History,
  Tag,
  CalendarRange,
  ArrowRight,
} from "lucide-react";
import { LazyContactForm } from "@/components/marketing/lazy-contact-form";
import { SpotlightCard } from "@/components/marketing/spotlight-card";
import { LogoMarquee } from "@/components/marketing/logo-marquee";
import { AudienceTabs, DashboardMockup, FaqList } from "@/components/marketing/home-islands";
import { HoverLift, Reveal, StepBadge, StepsLine } from "@/components/marketing/css-motion";

import { notFound } from "next/navigation";
import { isLang } from "@/lib/i18n";
import { homeMessages } from "@/messages/home";

// Composant serveur : le texte arrive dans le HTML (affichage immédiat, même en 3G) ; seuls les îlots interactifs s'hydratent.
// Les textes sont dans messages/home.ts ; ici, seulement les icônes et les liens, dans le même ordre.
const FEATURE_ICONS = [Building2, Users, Wallet, Wrench, BarChart3, FileText];
const CATALOG_LINKS = [
  { href: "/catalogue/locations", icon: KeyRound },
  { href: "/catalogue/sales", icon: Tag },
  { href: "/catalogue/short-stay", icon: CalendarRange },
];
const AUDIENCE_KEYS = ["agence", "proprietaire", "locataire"];
const SECURITY_ICONS = [Lock, KeyRound, Eye, History];

function HeroBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0B5FFF 1px, transparent 1px), linear-gradient(to bottom, #0B5FFF 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="ivo-pulse absolute -right-20 top-0 h-[26rem] w-[26rem] rounded-full bg-primary/10" />
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  // Une adresse d'un seul niveau avec extension (/wp-login.php…) échappe au middleware et arrive ici : vrai 404.
  const lang = (await params).lang;
  if (!isLang(lang)) notFound();
  const m = homeMessages[lang];
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
        <HeroBlobs />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="ivo-rise inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              {m.hero.badge}
            </span>
            <h1
              className="ivo-rise mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-primary-dark sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "100ms" }}
            >
              {m.hero.title}<span className="text-primary">{m.hero.titleAccent}</span>
            </h1>
            <p className="ivo-rise mt-5 max-w-xl text-lg leading-relaxed text-ink-muted" style={{ animationDelay: "200ms" }}>
              {m.hero.lead}
            </p>
            <div className="ivo-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
              <Link href="#contact" className="group relative overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5">
                <span className="relative z-10">{m.hero.demo}</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
              <Link href="/securite" className="inline-flex items-center px-2 py-3 text-sm font-semibold text-ink-muted transition-colors hover:text-primary hover:underline">
                {m.hero.security}
              </Link>
            </div>
          </div>
          <DashboardMockup labels={m.mockup} />
        </div>
      </section>

      <section id="catalogue" className="scroll-mt-20 border-y border-gray-100 bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.catalog.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.catalog.title}</h2>
            <p className="mt-3 text-ink-muted">{m.catalog.lead}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.catalog.offers.map((o, i) => {
              const { href, icon: Icon } = CATALOG_LINKS[i];
              return (
              <Reveal key={href} delay={i * 0.08}>
                <Link href={href} className="group block h-full rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{o.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{o.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {m.catalog.see} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="paiements-titre" className="border-y border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-5">
          <p id="paiements-titre" className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {m.payments.title}
          </p>
          <LogoMarquee label={m.payments.aria} bankTransfer={m.payments.bankTransfer} />
        </div>
      </section>

      <section id="fonctionnalites" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.features.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.features.title}</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
              <Reveal key={f.title} delay={i * 0.06}>
                <SpotlightCard className="h-full">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.text}</p>
                </SpotlightCard>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.steps.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.steps.title}</h2>
          </Reveal>
          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <StepsLine />
            {m.steps.items.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.15}>
                <div className="relative rounded-2xl bg-white p-7 shadow-sm">
                  <StepBadge n={`0${i + 1}`} index={i} />
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
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.audience.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.audience.title}</h2>
          </Reveal>

          <AudienceTabs label={m.audience.tabsLabel} audiences={m.audience.items.map((a, i) => ({ ...a, key: AUDIENCE_KEYS[i] }))} />
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-20 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.pricing.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.pricing.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">{m.pricing.lead}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {m.pricing.tiers.map((t, i) => {
              const highlight = i === 1;
              return (
              <Reveal key={t.name} delay={i * 0.08}>
                <HoverLift className={`flex h-full flex-col rounded-2xl bg-white p-7 ${highlight ? "ring-2 ring-primary shadow-xl shadow-primary/15" : "border border-gray-100 shadow-sm"}`}>
                  <h3 className="text-xl font-bold text-ink">{t.name}</h3>
                  <p className="text-sm text-ink-muted">{t.size}</p>
                  <p className="mt-4 text-2xl font-extrabold text-primary-dark">{m.pricing.onQuote}</p>
                  <ul className="mt-5 flex-1 space-y-3">
                    {t.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="#contact" className={`mt-7 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors ${highlight ? "bg-primary text-white hover:bg-primary/90" : "border border-gray-200 text-ink hover:border-primary/40 hover:text-primary"}`}>
                    {m.pricing.cta}
                  </Link>
                </HoverLift>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.security.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.security.title}</h2>
            <p className="mt-4 text-ink-muted">{m.security.lead}</p>
            <Link href="/securite" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              {m.security.link}
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
            {m.security.items.map((label, i) => ({ label, icon: SECURITY_ICONS[i] })).map((s) => (
              <HoverLift key={s.label} lift={-4} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="text-sm font-semibold text-ink">{s.label}</p>
              </HoverLift>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-surface py-20">
        <div className="mx-auto max-w-3xl px-5">
          <Reveal className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.faq.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.faq.title}</h2>
          </Reveal>
          <FaqList items={m.faq.items} />
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.contact.eyebrow}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.contact.title}</h2>
            <p className="mt-4 text-ink-muted">{m.contact.lead}</p>
            <p className="mt-6 text-sm text-ink-muted">{m.contact.already} <Link href="/login" className="font-semibold text-primary hover:underline">{m.contact.loginLink}</Link>.</p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-primary/5 sm:p-8 lg:col-span-3">
            <LazyContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
