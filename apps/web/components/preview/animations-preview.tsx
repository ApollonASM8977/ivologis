"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { Building2, Users, Wallet, Wrench, BarChart3, FileText, Check, Receipt, Smartphone, Hammer, Briefcase, Home, KeyRound } from "lucide-react";
import { DashboardMockup } from "@/components/marketing/home-islands";
import { AnimatedBeam, AnimatedGridPattern, BlurFade, BorderBeam, DirectionAwareTabs, MagicCard, NumberTicker, ShimmerLink, TextRoll, WordRotate } from "./effects";
import type { homeMessages } from "@/messages/home";
import type { previewMessages } from "@/messages/preview";

type Home = (typeof homeMessages)["fr"];
type Preview = (typeof previewMessages)["fr"];

const FEATURE_ICONS = [Building2, Users, Wallet, Wrench, BarChart3, FileText];
const LEFT_ICONS = [Briefcase, Home, KeyRound];
const RIGHT_ICONS = [Receipt, Smartphone, Hammer];

/** Étiquette « bibliothèque utilisée » (nom propre, identique dans les deux langues). */
function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">{children}</span>;
}

function Node({ nodeRef, icon: Icon, label, big }: { nodeRef: React.RefObject<HTMLDivElement | null>; icon: typeof Home; label: string; big?: boolean }) {
  return (
    <div className="z-10 flex flex-col items-center gap-1.5">
      <div ref={nodeRef} className={`flex items-center justify-center rounded-full border-2 border-gray-100 bg-white shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${big ? "h-20 w-20" : "h-12 w-12"}`}>
        <Icon className={big ? "h-9 w-9 text-primary" : "h-5 w-5 text-primary-dark"} />
      </div>
      <span className="text-xs font-semibold text-ink">{label}</span>
    </div>
  );
}

function Flow({ p }: { p: Preview }) {
  const box = useRef<HTMLDivElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const l0 = useRef<HTMLDivElement>(null), l1 = useRef<HTMLDivElement>(null), l2 = useRef<HTMLDivElement>(null);
  const r0 = useRef<HTMLDivElement>(null), r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null);
  const left = [l0, l1, l2], right = [r0, r1, r2];
  return (
    <div ref={box} className="relative mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-gray-100 bg-white px-6 py-10 shadow-sm sm:px-12">
      <div className="flex flex-col gap-8">
        {left.map((r, i) => <Node key={i} nodeRef={r} icon={LEFT_ICONS[i]} label={p.flowLeft[i]} />)}
      </div>
      <Node nodeRef={center} icon={Building2} label="IVOLOGIS" big />
      <div className="flex flex-col gap-8">
        {right.map((r, i) => <Node key={i} nodeRef={r} icon={RIGHT_ICONS[i]} label={p.flowRight[i]} />)}
      </div>
      {left.map((r, i) => <AnimatedBeam key={`l${i}`} containerRef={box} fromRef={r} toRef={center} curvature={(1 - i) * 40} delay={i * 0.4} />)}
      {right.map((r, i) => <AnimatedBeam key={`r${i}`} containerRef={box} fromRef={center} toRef={r} curvature={(1 - i) * 40} delay={1.2 + i * 0.4} reverse />)}
    </div>
  );
}

export function AnimationsPreview({ m, p, lang }: { m: Home; p: Preview; lang: string }) {
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  return (
    <MotionConfig reducedMotion="user">
      <div className="sticky top-16 z-40 border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-xs font-medium text-amber-900">
        {p.banner}{" "}
        <Link href="/" className="font-semibold underline">{p.back}</Link>
      </div>

      {/* Héros */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
        <AnimatedGridPattern className="[mask-image:radial-gradient(520px_circle_at_70%_30%,white,transparent)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              <Tag>Magic UI · Animated Grid Pattern</Tag>
              <Tag>Magic UI · Word Rotate</Tag>
              <Tag>Magic UI · Shimmer Button</Tag>
              <Tag>Skiper UI · Text Roll</Tag>
            </div>
            <span className="relative inline-flex items-center overflow-hidden rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              {m.hero.badge}
              <BorderBeam size={40} duration={5} />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-primary-dark sm:text-5xl lg:text-6xl">
              {m.hero.title}
              <br />
              <WordRotate words={p.rotate} className="text-primary" />
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">{m.hero.lead}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ShimmerLink href="/#contact">{m.hero.demo}</ShimmerLink>
              <Link href="/securite" className="px-2 py-3 text-sm font-semibold text-ink-muted">
                <TextRoll>{m.hero.security}</TextRoll>
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-2"><Tag>Magic UI · Border Beam</Tag></div>
            <div className="relative rounded-2xl">
              <DashboardMockup labels={m.mockup} />
              <BorderBeam size={120} duration={8} width={2} />
            </div>
          </div>
        </div>
      </section>

      {/* Chiffres */}
      <section className="border-y border-gray-100 bg-surface py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-primary-dark">{p.statsTitle}</h2>
            <Tag>Magic UI · Number Ticker</Tag>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {p.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <NumberTicker value={s.value} locale={locale} className="text-4xl font-extrabold text-primary" />
                <p className="mt-2 text-sm text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">{m.features.eyebrow}</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary-dark">{m.features.title}</h2>
            </div>
            <Tag>Magic UI · Magic Card + Blur Fade</Tag>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <BlurFade key={f.title} delay={i * 0.08}>
                  <MagicCard className="h-full">
                    <div className="p-7">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.text}</p>
                    </div>
                  </MagicCard>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      {/* Circulation de l'information */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <Tag>Magic UI · Animated Beam</Tag>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-dark">{p.flowTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-muted">{p.flowLead}</p>
          </div>
          <div className="mt-10">
            <Flow p={p} />
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-center">
            <Tag>Cult UI · Direction Aware Tabs</Tag>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary-dark">{m.audience.title}</h2>
          </div>
          <div className="mt-8">
            <DirectionAwareTabs
              label={m.audience.tabsLabel}
              tabs={m.audience.items.map((a, i) => ({
                id: i,
                label: a.label,
                content: (
                  <div className="grid items-center gap-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:grid-cols-2">
                    <div>
                      <h3 className="text-2xl font-bold text-ink">{a.title}</h3>
                      <p className="mt-2 text-ink-muted">{a.intro}</p>
                    </div>
                    <ul className="space-y-3">
                      {a.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                            <Check className="h-3.5 w-3.5 text-success" />
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              }))}
            />
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="bg-primary-dark py-16 text-white">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <Tag>Skiper UI · Text Roll (skiper58)</Tag>
          <p className="mt-3 text-sm text-white/70">{p.menuTitle}</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4">
            {p.menu.map((w) => (
              <li key={w} className="cursor-pointer">
                <TextRoll className="text-4xl font-extrabold uppercase leading-[0.9] tracking-tight lg:text-5xl">{w}</TextRoll>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fin */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-dark">{p.endTitle}</h2>
        <div className="mt-6 flex justify-center">
          <ShimmerLink href="/#contact">{m.hero.demo}</ShimmerLink>
        </div>
      </section>
    </MotionConfig>
  );
}
