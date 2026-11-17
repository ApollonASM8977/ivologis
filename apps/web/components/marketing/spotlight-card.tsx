"use client";

import { useRef, type ReactNode } from "react";

/** Carte avec halo qui suit la souris ou le doigt ; soulèvement et appui en CSS (`ivo-lift`). */
export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerDown={onMove}
      className={`ivo-lift group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/10 active:shadow-xl active:shadow-primary/10 ${className}`}
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "0%", ["--ivo-lift" as string]: "-4px" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100"
        style={{
          background: "radial-gradient(360px circle at var(--mx) var(--my), rgba(11,95,255,0.12), transparent 60%)",
        }}
      />
      <div className="relative h-full p-6">{children}</div>
    </div>
  );
}
