"use client";

import { Building2, KeyRound, LineChart, Wallet } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { motion } from "motion/react";

const floatIcons = [
  { Icon: Building2, top: "18%", left: "72%", delay: 0, size: 34 },
  { Icon: KeyRound, top: "62%", left: "80%", delay: 0.6, size: 26 },
  { Icon: Wallet, top: "72%", left: "14%", delay: 1.1, size: 28 },
  { Icon: LineChart, top: "28%", left: "10%", delay: 1.6, size: 26 },
];

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
        {/* Animated gradient blobs */}
        <motion.div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/40 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-32 -right-10 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating accent icons */}
        {floatIcons.map(({ Icon, top, left, delay, size }, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm"
            style={{ top, left, width: size + 24, height: size + 24 }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.4 + delay },
              scale: { duration: 0.6, delay: 0.4 + delay },
              y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay },
            }}
          >
            <Icon style={{ width: size, height: size }} className="text-white/70" strokeWidth={1.5} />
          </motion.div>
        ))}

        <motion.div
          className="relative z-10 flex items-center gap-2"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BrandLogo size="md" inverse />
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
            Biens, locataires, contrats, paiements Mobile Money et maintenance — tout IVOLOGIS
            dans une seule plateforme.
          </p>
        </motion.div>

        <motion.p
          className="relative z-10 text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          © {new Date().getFullYear()} IVOLOGIS — Abidjan, Côte d&apos;Ivoire
        </motion.p>
      </aside>

      <main id="contenu" className="flex w-full flex-col items-center justify-center bg-surface px-6 py-12 lg:w-1/2">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-8 lg:hidden">
            <BrandLogo size="md" />
          </div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </main>
    </div>
  );
}
