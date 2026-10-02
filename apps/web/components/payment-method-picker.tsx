"use client";

import { Banknote, Building2, Smartphone } from "lucide-react";
import clsx from "clsx";
import { PAYMENT_METHOD_COLORS, PAYMENT_METHOD_LABELS, PaymentMethod } from "@ivologis/shared";

const ICONS: Partial<Record<PaymentMethod, typeof Smartphone>> = {
  [PaymentMethod.CASH]: Banknote,
  [PaymentMethod.BANK_TRANSFER]: Building2,
};

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
    <div className="grid grid-cols-3 gap-2">
      {methods.map((m) => {
        const colors = PAYMENT_METHOD_COLORS[m] ?? { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280" };
        const Icon = ICONS[m] ?? Smartphone;
        const active = value === m;
        return (
          <button
            type="button"
            key={m}
            onClick={() => onChange(m)}
            className={clsx(
              "flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-2.5 text-center transition-all",
              active ? "shadow-sm" : "border-gray-200 bg-white hover:border-gray-300",
            )}
            style={active ? { borderColor: colors.border, backgroundColor: `${colors.bg}14` } : undefined}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-medium leading-tight text-ink">{PAYMENT_METHOD_LABELS[m]}</span>
          </button>
        );
      })}
    </div>
  );
}
