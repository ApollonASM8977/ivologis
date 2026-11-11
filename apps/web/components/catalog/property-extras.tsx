"use client";

import { CardHeader } from "@/components/ui/card";

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
