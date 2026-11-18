"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { t } from "@/lib/t-auth";

/** Gabarit des pages de connexion : animations en CSS (`ivo-*`), le formulaire est visible dès le premier affichage. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside aria-label={t("Présentation IVOLOGIS")} className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-dark p-12 text-white lg:flex">
        <div className="ivo-pulse pointer-events-none absolute -bottom-40 -right-20 h-[26rem] w-[26rem] rounded-full bg-blue-500/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: // i18n-ok : valeur CSS
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="ivo-slide-in relative z-10 flex items-center gap-2">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <BrandLogo size="md" inverse />
          </Link>
        </div>

        <div className="ivo-rise relative z-10" style={{ animationDelay: "150ms" }}>
          <h2 className="text-3xl font-bold leading-tight">
            {t("La gestion immobilière,")}<br />{t("simplifiée pour la Côte d'Ivoire.")}
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            {t("Tout IVOLOGIS : biens, locataires, contrats, paiements Mobile Money et maintenance dans une seule plateforme.")}
          </p>
        </div>

        <p className="ivo-fade-in relative z-10 text-sm text-white/50" style={{ animationDelay: "300ms" }}>
          © {new Date().getFullYear()}{" "}{t("IVOLOGIS, Abidjan, Côte d'Ivoire")}
        </p>
      </aside>

      <main id="contenu" className="flex w-full flex-col items-center justify-center bg-surface px-6 py-12 lg:w-1/2">
        <div className="ivo-rise w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/">
              <BrandLogo size="md" />
            </Link>
          </div>
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" />{" "}{t("Retour à l'accueil")}
          </Link>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
