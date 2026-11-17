"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { MapPin, KeyRound } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";
import { DemoBadge, locationLabel } from "@/components/catalog/property-extras";

export function RentalsCatalog({ basePath }: { basePath: string }) {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["catalog", "rentals"],
    queryFn: async () => (await api.get("/catalog/rentals")).data,
  });

  return (
    <div>
      <PageHeader title="Logements à louer" subtitle="Location au mois : loyer, avance et caution affichés, frais d'agence encadrés" />

      {isLoading ? (
        <LoadingState hint="Premier chargement : jusqu'à une minute si le site était inactif." />
      ) : !data?.length ? (
        <EmptyState icon={KeyRound} title="Aucun logement à louer pour le moment" description="Revenez bientôt, de nouvelles annonces seront publiées ici." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const cover = p.images?.find((img: any) => img.isCover) ?? p.images?.[0];
            return (
              <Link key={p.id} href={`${basePath}/${p.id}`}>
                <div className="h-full cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative h-40 w-full bg-gray-100">
                    {p.isDemo && (
                      <span className="absolute left-2 top-2 z-10">
                        <DemoBadge />
                      </span>
                    )}
                    {cover ? (
                      <Image src={fileUrl(cover.url) ?? ""} alt={p.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-muted">
                        <KeyRound className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="h-3.5 w-3.5" /> {locationLabel(p)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">
                      {PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS]}
                      {p.rooms ? ` · ${p.rooms} pièces` : ""}
                      {p.furnished ? " · meublé" : ""}
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">{formatXOF(Number(p.rentAmount))} / mois</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
