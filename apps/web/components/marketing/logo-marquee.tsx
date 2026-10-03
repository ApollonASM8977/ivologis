"use client";

import Image from "next/image";
import { motion } from "motion/react";

const LOGOS = [
  { src: "/logos/orange-money.jpg", alt: "Orange Money" },
  { src: "/logos/mtn-momo.png", alt: "MTN MoMo" },
  { src: "/logos/moov-money.png", alt: "Moov Money" },
  { src: "/logos/wave.png", alt: "Wave" },
  { src: "/logos/bank-transfer.jpg", alt: "Virement bancaire" },
];

export function LogoMarquee() {
  const row = [...LOGOS, ...LOGOS];
  return (
    <div className="relative overflow-hidden py-2" aria-label="Moyens de paiement pris en charge">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
      <motion.div
        className="flex w-max gap-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {row.map((l, i) => (
          <div
            key={`${l.alt}-${i}`}
            className="relative h-11 w-20 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-black/5 shadow-sm"
            aria-hidden={i >= LOGOS.length}
          >
            <Image src={l.src} alt={i < LOGOS.length ? l.alt : ""} fill sizes="80px" className="object-cover" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
