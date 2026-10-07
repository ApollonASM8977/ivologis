"use client";

import { motion } from "motion/react";

const WORDMARK = "IVOLOGIS";

/**
 * Marque composée de deux parcelles superposées : un symbole abstrait
 * pour un portefeuille de biens, sans pictogramme de maison générique.
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

  const Wrapper = animate ? motion.span : "span";
  const wrapperProps = animate
    ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: "easeOut" } }
    : {};

  return (
    <Wrapper {...(wrapperProps as object)} className={`inline-flex items-center gap-2.5 ${className}`} aria-label={WORDMARK}>
      <span className={`relative flex ${box} shrink-0 items-center justify-center rounded-[10px] ${mark}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none">
          <rect x="9" y="5" width="10" height="10" rx="2.2" fill="currentColor" opacity="0.45" />
          <rect x="5" y="9" width="10" height="10" rx="2.2" fill="currentColor" />
        </svg>
      </span>
      <span className={`font-bold tracking-tight ${text} ${word}`}>{WORDMARK}</span>
    </Wrapper>
  );
}
