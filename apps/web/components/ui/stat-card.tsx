"use client";

import { useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString("fr-FR"));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => rounded.on("change", (v) => {
    if (ref.current) ref.current.textContent = v;
  }), [rounded]);

  return <span ref={ref}>0</span>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger";
  hint?: string;
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-50 text-success",
    warning: "bg-amber-50 text-warning",
    danger: "bg-red-50 text-danger",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: "0 12px 24px -12px rgba(11,95,255,0.18)" }}
      transition={{ duration: 0.35 }}
      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <motion.span
          whileHover={{ rotate: 6, scale: 1.08 }}
          className={clsx("flex h-9 w-9 items-center justify-center rounded-lg", toneClass)}
        >
          <Icon className="h-4.5 w-4.5" />
        </motion.span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </motion.div>
  );
}
