"use client";

import { FlaskConical, MessageCircle, Phone } from "lucide-react";
import { CardHeader } from "@/components/ui/card";
import { usePublicCompany } from "@/lib/use-company";

/** Numéro international pour wa.me : les numéros ivoiriens à 10 chiffres reçoivent l'indicatif 225. */
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `225${digits}` : digits;
}

/** Contact en deux gestes vers l'agence (jamais vers le propriétaire). */
export function AgencyContact({ listingName, disabled }: { listingName: string; disabled?: boolean }) {
  const { data: company } = usePublicCompany();
  const whatsapp = company?.whatsappPhone;
  const phone = company?.phone;
  if (disabled || (!whatsapp && !phone)) return null;
  const message = `Bonjour, je suis intéressé(e) par l'annonce « ${listingName} » : ${typeof window !== "undefined" ? window.location.href : ""}`;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {whatsapp && (
        <a
          href={`https://wa.me/${waNumber(whatsapp)}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F8F4E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#19773F]"
        >
          <MessageCircle className="h-4 w-4" /> Écrire à l&apos;agence sur WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-primary/40 hover:text-primary"
        >
          <Phone className="h-4 w-4" /> Appeler l&apos;agence
        </a>
      )}
    </div>
  );
}

interface Located {
  address?: string | null;
  neighborhood?: string | null;
  commune?: string | null;
  city?: string | null;
}

/** « Quartier, Commune » (+ ville hors Abidjan), avec l'adresse en tête si demandée. */
export function locationLabel(p: Located, withAddress = false) {
  const city = p.city && p.city !== "Abidjan" && p.city !== p.commune ? p.city : null;
  const address = withAddress ? p.address : null;
  // Les adresses saisies contiennent souvent déjà le quartier ou la commune : on évite « Yopougon, Yopougon ».
  const rest = [p.neighborhood, p.commune, city].filter((part) => part && !address?.toLowerCase().includes(part.toLowerCase()));
  return [address, ...rest].filter(Boolean).join(", ");
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
      <FlaskConical className="h-3 w-3" aria-hidden="true" /> Démo
    </span>
  );
}

export function DemoNotice() {
  return (
    <div role="note" className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
      <p>
        <strong>Annonce de démonstration.</strong> Ce bien est fictif : il sert à montrer le fonctionnement du catalogue. Les photos, le prix et
        les documents ne correspondent à aucun bien réel, et aucune demande ne peut être envoyée.
      </p>
    </div>
  );
}

export function LocationMap({ latitude, longitude }: { latitude?: number | string | null; longitude?: number | string | null }) {
  const lat = latitude != null ? Number(latitude) : null;
  const lng = longitude != null ? Number(longitude) : null;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const delta = 0.01;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5 pb-0">
        <CardHeader title="Emplacement" />
      </div>
      <iframe src={src} loading="lazy" className="h-64 w-full border-0" title="Emplacement du bien" />
    </div>
  );
}

export function VirtualTourCard({ url }: { url?: string | null }) {
  if (!url) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5 pb-0">
        <CardHeader title="Visite virtuelle 360°" />
      </div>
      <iframe src={url} loading="lazy" allow="xr-spatial-tracking; gyroscope; accelerometer" className="h-96 w-full border-0" title="Visite virtuelle 360°" />
    </div>
  );
}
