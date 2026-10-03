"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/#fonctionnalites", label: "Fonctionnalités" },
  { href: "/#pour-qui", label: "Pour qui" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/securite", label: "Sécurité" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">I</span>
          <span className="text-base font-bold tracking-tight text-primary-dark">IVOLOGIS</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-ink-muted transition-colors hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-gray-50 sm:block">
            Se connecter
          </Link>
          <Link
            href="/#contact"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Demander une démo
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-ink md:hidden"
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-gray-100 bg-white md:hidden"
            aria-label="Navigation mobile"
          >
            <div className="flex flex-col gap-1 p-4">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-gray-50">
                  {l.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5">
                Se connecter
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
