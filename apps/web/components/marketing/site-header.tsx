"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const LINKS = [
  { href: "/catalogue", label: "Catalogue" },
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
        <Link href="/" className="rounded-md focus-visible:outline-2 focus-visible:outline-primary">
          <BrandLogo size="sm" />
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

      {/* Ouverture/fermeture animées en CSS (grille 0fr → 1fr) ; menu inerte quand il est fermé. */}
      <nav
        className={`grid border-t border-gray-100 bg-white transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] border-transparent opacity-0"}`}
        aria-label="Navigation mobile"
        inert={!open}
      >
        <div className="flex flex-col gap-1 overflow-hidden px-4">
          <span className="h-3" />
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-gray-50 ${open ? "ivo-slide-in" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5">
            Se connecter
          </Link>
          <span className="h-3" />
        </div>
      </nav>
    </header>
  );
}
