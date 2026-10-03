"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";

export function CountUp({
  value,
  format = (n: number) => Math.round(n).toLocaleString("fr-FR"),
  duration = 1.2,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
