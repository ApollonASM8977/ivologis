"use client";

import { useEffect, useState } from "react";
import { locale } from "@/lib/t";

/** Compteur animé (montant, nombre) ; requestAnimationFrame natif, sans bibliothèque. Respecte « réduire les animations ». */
export function CountUp({
  value,
  format = (n: number) => Math.round(n).toLocaleString(locale()),
  duration = 1.2,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      setDisplay(value * (1 - Math.pow(1 - t, 3))); // ease-out cubique
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
