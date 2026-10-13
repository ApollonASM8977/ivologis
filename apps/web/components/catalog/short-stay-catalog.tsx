"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { MapPin, CalendarRange } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";

export function ShortStayCatalog({ basePath }: { basePath: string }) {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["catalog", "short-stay"],
    queryFn: async () => (await api.get("/catalog/short-stay")).data,
  });

  return (
    <div>
      <PageHeader title="Résidences meublées en courte durée" subtitle="Séjours à la nuitée, disponibilité en temps réel" />

      {isLoading ? (
        <LoadingState />
      ) : !data?.length ? (
        <EmptyState icon={CalendarRange} title="Aucune résidence disponible pour le moment" description="Revenez bientôt, de nouvelles annonces seront publiées ici." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const cover = p.images?.find((img: any) => img.isCover) ?? p.images?.[0];
            return (
              <Link key={p.id} href={`${basePath}/${p.id}`}>
                <div className="h-full cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative h-40 w-full bg-gray-100">
                    {cover ? (
                      <Image src={fileUrl(cover.url) ?? ""} alt={p.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ink-muted">
                        <CalendarRange className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="h-3.5 w-3.5" /> {p.commune}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-ink-muted">{PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS]}</p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {p.shortStayNightlyRate ? `${formatXOF(Number(p.shortStayNightlyRate))}/nuit` : "Tarif sur demande"}
                    </p>
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
