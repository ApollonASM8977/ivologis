"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { PAYMENT_METHOD_COLORS, PAYMENT_METHOD_LABELS, PaymentMethod } from "@ivologis/shared";
import { PaymentLogo } from "./payment-logo";

export function PaymentMethodPicker({
  value,
  onChange,
  methods = Object.values(PaymentMethod),
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  methods?: PaymentMethod[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {methods.map((m) => {
        const colors = PAYMENT_METHOD_COLORS[m] ?? { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280" };
        const active = value === m;
        return (
          <motion.button
            type="button"
            key={m}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(m)}
            className={clsx(
              "relative flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-center transition-colors",
              active ? "shadow-md" : "border-gray-200 bg-white hover:border-gray-300",
            )}
            style={active ? { borderColor: colors.border, backgroundColor: `${colors.bg}10` } : undefined}
          >
            {active && (
              <motion.span
                layoutId="payment-picker-check"
                className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </motion.span>
            )}
            <PaymentLogo method={m} className="h-9 w-14" />
            <span className="text-[11px] font-medium leading-tight text-ink">{PAYMENT_METHOD_LABELS[m]}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
