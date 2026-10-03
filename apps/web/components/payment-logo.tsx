import { PaymentMethod } from "@ivologis/shared";

interface Mark {
  bg: string;
  fg: string;
  word: string;
  sub?: string;
  wave?: boolean;
}

const MARKS: Partial<Record<PaymentMethod, Mark>> = {
  [PaymentMethod.ORANGE_MONEY]: { bg: "#FF7900", fg: "#FFFFFF", word: "orange", sub: "money" },
  [PaymentMethod.MTN_MONEY]: { bg: "#FFCB05", fg: "#111827", word: "MTN", sub: "MoMo" },
  [PaymentMethod.MOOV_MONEY]: { bg: "#0076BE", fg: "#FFFFFF", word: "moov", sub: "money" },
  [PaymentMethod.WAVE]: { bg: "#1DC8FF", fg: "#FFFFFF", word: "wave", wave: true },
};

const FALLBACK: Record<string, Mark> = {
  [PaymentMethod.CASH]: { bg: "#16A34A", fg: "#FFFFFF", word: "Espèces" },
  [PaymentMethod.BANK_TRANSFER]: { bg: "#1E3A8A", fg: "#FFFFFF", word: "Virement" },
};

export function PaymentLogo({ method, className = "h-8 w-12" }: { method: PaymentMethod; className?: string }) {
  const mark = MARKS[method] ?? FALLBACK[method] ?? { bg: "#6B7280", fg: "#FFFFFF", word: method };

  return (
    <svg viewBox="0 0 64 40" className={className} role="img" aria-label={mark.word} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="40" rx="9" fill={mark.bg} />
      {mark.wave ? (
        <path d="M10 26 q6 -8 12 0 t12 0 t12 0 t8 -2" fill="none" stroke={mark.fg} strokeWidth="3" strokeLinecap="round" />
      ) : null}
      {mark.sub ? (
        <>
          <text x="32" y="20" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontWeight="800" fontSize="11.5" fill={mark.fg}>
            {mark.word}
          </text>
          <text x="32" y="32" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontWeight="600" fontSize="7.5" fill={mark.fg} opacity="0.9">
            {mark.sub}
          </text>
        </>
      ) : mark.wave ? (
        <text x="32" y="35" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontWeight="800" fontSize="9" fill={mark.fg}>
          {mark.word}
        </text>
      ) : (
        <text x="32" y="25" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontWeight="700" fontSize="9" fill={mark.fg}>
          {mark.word}
        </text>
      )}
    </svg>
  );
}
