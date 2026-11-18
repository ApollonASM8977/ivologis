"use client";

import Image from "next/image";
import { useSlowConnection } from "@/lib/use-slow-connection";

const LOGOS = [
  { src: "/logos/orange-money.jpg", alt: "Orange Money" },
  { src: "/logos/mtn-momo.png", alt: "MTN MoMo" },
  { src: "/logos/moov-money.png", alt: "Moov Money" },
  { src: "/logos/wave.png", alt: "Wave" },
  { src: "/logos/bank-transfer.jpg", alt: "" },
];

function LogoTile({ src, alt, hidden }: { src: string; alt: string; hidden?: boolean }) {
  return (
    <div className="relative h-11 w-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/5 shadow-sm" aria-hidden={hidden}>
      <Image src={src} alt={hidden ? "" : alt} fill sizes="80px" className="object-cover" />
    </div>
  );
}

/** Libellés fournis par la page (langue) ; seul « Virement bancaire » se traduit, les marques restent telles quelles. */
export function LogoMarquee({ label, bankTransfer }: { label: string; bankTransfer: string }) {
  const slow = useSlowConnection();
  const logos = LOGOS.map((l) => (l.alt ? l : { ...l, alt: bankTransfer }));

  if (slow) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 py-2" aria-label={label}>
        {logos.map((l) => (
          <LogoTile key={l.alt} src={l.src} alt={l.alt} />
        ))}
      </div>
    );
  }

  const row = [...logos, ...logos];
  return (
    <div className="relative overflow-hidden py-2" aria-label={label}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
      <div className="ivo-marquee flex w-max gap-4">
        {row.map((l, i) => (
          <LogoTile key={`${l.alt}-${i}`} src={l.src} alt={l.alt} hidden={i >= LOGOS.length} />
        ))}
      </div>
    </div>
  );
}
