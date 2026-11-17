import type { CSSProperties, ReactNode } from "react";

/**
 * Animations sans JavaScript (composants serveur) : classes `ivo-*` de globals.css, exécutées par le navigateur.
 * Utilisables partout, y compris dans des composants serveur : rien à hydrater.
 */

/** Apparition au défilement, pilotée par le navigateur (aucun JavaScript). */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={`ivo-reveal ${className}`}>{children}</div>;
}

/** Soulèvement au survol (souris) et léger enfoncement au toucher (téléphone). */
export function HoverLift({ children, className = "", lift = -6 }: { children: ReactNode; className?: string; lift?: number }) {
  return (
    <div className={`ivo-lift ${className}`} style={{ "--ivo-lift": `${lift}px` } as CSSProperties}>
      {children}
    </div>
  );
}

export function StepsLine() {
  return (
    <div
      aria-hidden="true"
      className="ivo-reveal-line absolute left-[16%] right-[16%] top-7 hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 md:block"
    />
  );
}

export function StepBadge({ n }: { n: string; index?: number }) {
  return (
    <span className="ivo-reveal-scale mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-black text-white shadow-lg shadow-primary/30">
      {n}
    </span>
  );
}

