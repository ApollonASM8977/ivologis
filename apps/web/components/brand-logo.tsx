"use client";

import { motion } from "motion/react";

const WORDMARK = "IVOLOGIS";

/**
 * Monogramme "I" surmonté d'un accent en chevron (toit stylisé, sans dessiner
 * une maison littérale) sur un fond asymétrique à deux coins arrondis.
 */
export function BrandLogo({
  size = "md",
  animate = true,
  inverse = false,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  inverse?: boolean;
  className?: string;
}) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  const mark = inverse ? "bg-white text-primary" : "bg-primary text-white";
  const word = inverse ? "text-white" : "text-primary-dark";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label={WORDMARK}>
      <motion.span
        initial={animate ? { opacity: 0, scale: 0.55, rotate: -10 } : false}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.08, rotate: -4 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 280, damping: 16 }}
        className={`relative flex ${box} shrink-0 items-center justify-center shadow-sm ${mark}`}
        style={{ borderRadius: "14px 6px 14px 6px" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" fill="currentColor">
          <path d="M12 4.4 L16.3 9.2 L7.7 9.2 Z" />
          <rect x="10.6" y="8.6" width="2.8" height="11.2" rx="1.4" />
        </svg>
      </motion.span>
      <motion.span
        initial={animate ? { opacity: 0, x: -6 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.12, duration: 0.3, ease: "easeOut" }}
        className={`font-bold tracking-tight ${text} ${word}`}
      >
        {WORDMARK}
      </motion.span>
    </span>
  );
}
