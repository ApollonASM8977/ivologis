import { PaymentMethod } from "@ivologis/shared";

const LOGOS: Partial<Record<PaymentMethod, { src: string; alt: string }>> = {
  [PaymentMethod.ORANGE_MONEY]: { src: "/logos/orange-money.jpg", alt: "Orange Money" },
  [PaymentMethod.MTN_MONEY]: { src: "/logos/mtn-momo.png", alt: "MTN MoMo" },
  [PaymentMethod.MOOV_MONEY]: { src: "/logos/moov-money.png", alt: "Moov Money" },
  [PaymentMethod.WAVE]: { src: "/logos/wave.png", alt: "Wave" },
  [PaymentMethod.BANK_TRANSFER]: { src: "/logos/bank-transfer.jpg", alt: "Virement bancaire" },
};

export function PaymentLogo({ method, className = "h-8 w-12" }: { method: PaymentMethod; className?: string }) {
  const logo = LOGOS[method];

  if (logo) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt={logo.alt} className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-600 text-[10px] font-bold text-white ${className}`}>
      Espèces
    </span>
  );
}
