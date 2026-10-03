"use client";

import { motion } from "motion/react";

const LETTERS = "IVOLOGIS".split("");

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
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="IVOLOGIS">
      <motion.span
        initial={animate ? { rotate: -90, scale: 0.6, opacity: 0 } : false}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.6 } }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={`relative flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-xl ${mark} shadow-md shadow-primary/30`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M12 3 L20 9.5 V20 H4 V9.5 Z"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
          <motion.path
            d="M9.5 20 V14.5 H14.5 V20"
            initial={animate ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
          />
        </svg>
        <motion.span
          aria-hidden="true"
          initial={animate ? { x: "-120%" } : false}
          animate={{ x: "120%" }}
          transition={{ duration: 1.1, delay: 0.9, ease: "easeInOut" }}
          className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
      </motion.span>
      <span className={`flex font-bold tracking-tight ${text} ${word}`}>
        {LETTERS.map((letter, i) => (
          <motion.span
            key={`${letter}-${i}`}
            initial={animate ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05, duration: 0.35, ease: "easeOut" }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
