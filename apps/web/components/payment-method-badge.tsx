import { PAYMENT_METHOD_COLORS, PAYMENT_METHOD_LABELS, PaymentMethod } from "@ivologis/shared";
import { PaymentLogo } from "./payment-logo";

export function PaymentMethodBadge({ method, size = "md" }: { method: PaymentMethod; size?: "sm" | "md" }) {
  const colors = PAYMENT_METHOD_COLORS[method] ?? { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280" };
  const logoClass = size === "sm" ? "h-4 w-6" : "h-5 w-8";
  const padding = size === "sm" ? "py-0.5 pl-0.5 pr-2 text-[11px]" : "py-0.5 pl-1 pr-2.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white font-semibold ring-1 ring-inset ring-gray-200 ${padding}`}
      style={{ color: colors.bg === "#FFCB05" ? "#111827" : colors.bg }}
    >
      <PaymentLogo method={method} className={`${logoClass} shrink-0`} />
      <span className="text-ink">{PAYMENT_METHOD_LABELS[method]}</span>
    </span>
  );
}
