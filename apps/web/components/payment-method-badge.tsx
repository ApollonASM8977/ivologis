import { Banknote, Building2, Smartphone } from "lucide-react";
import { PAYMENT_METHOD_COLORS, PAYMENT_METHOD_LABELS, PaymentMethod } from "@ivologis/shared";

const ICONS: Partial<Record<PaymentMethod, typeof Smartphone>> = {
  [PaymentMethod.CASH]: Banknote,
  [PaymentMethod.BANK_TRANSFER]: Building2,
};

export function PaymentMethodBadge({ method, size = "md" }: { method: PaymentMethod; size?: "sm" | "md" }) {
  const colors = PAYMENT_METHOD_COLORS[method] ?? { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280" };
  const Icon = ICONS[method] ?? Smartphone;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {PAYMENT_METHOD_LABELS[method]}
    </span>
  );
}
