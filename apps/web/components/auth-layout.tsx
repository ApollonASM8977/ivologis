"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { motion } from "motion/react";

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
      <aside aria-label="Présentation IVOLOGIS" className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-dark p-12 text-white lg:flex">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-40 -right-20 h-[26rem] w-[26rem] rounded-full bg-blue-500/10"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          className="relative z-10 flex items-center gap-2"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="transition-opacity hover:opacity-80">
            <BrandLogo size="md" inverse />
          </Link>
        </motion.div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h2 className="text-3xl font-bold leading-tight">
            La gestion immobilière,<br />simplifiée pour la Côte d&apos;Ivoire.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Tout IVOLOGIS : biens, locataires, contrats, paiements Mobile Money et maintenance
            dans une seule plateforme.
          </p>
        </motion.div>

        <motion.p
          className="relative z-10 text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          © {new Date().getFullYear()} IVOLOGIS, Abidjan, Côte d&apos;Ivoire
        </motion.p>
      </aside>

      <main id="contenu" className="flex w-full flex-col items-center justify-center bg-surface px-6 py-12 lg:w-1/2">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/">
              <BrandLogo size="md" />
            </Link>
          </div>
          <Link href="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;accueil
          </Link>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}
