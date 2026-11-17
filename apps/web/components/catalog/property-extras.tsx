"use client";

import { FlaskConical } from "lucide-react";
import { CardHeader } from "@/components/ui/card";

interface Located {
  address?: string | null;
  neighborhood?: string | null;
  commune?: string | null;
  city?: string | null;
}

/** « Quartier, Commune » (+ ville hors Abidjan), avec l'adresse en tête si demandée. */
export function locationLabel(p: Located, withAddress = false) {
  const city = p.city && p.city !== "Abidjan" && p.city !== p.commune ? p.city : null;
  return [withAddress ? p.address : null, p.neighborhood, p.commune, city].filter(Boolean).join(", ");
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
