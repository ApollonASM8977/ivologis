"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Home } from "lucide-react";
import { api, fileUrl } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";

export default function TenantPropertyPage() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });

  if (isLoading) return <LoadingState />;
  const property = properties?.[0];

  if (!property) {
    return (
      <div>
        <PageHeader title="Mon logement" />
        <EmptyState icon={Home} title="Aucun logement associé à votre compte" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mon logement" subtitle={property.name} />

      {property.images?.length ? (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {property.images.map((img: any) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} src={fileUrl(img.url)} alt={property.name} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      ) : null}

      <Card>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-ink">{property.name}</h2>
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
          <MapPin className="h-4 w-4" /> {property.address}, {property.commune}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-ink-muted">Type</p>
            <p className="font-medium text-ink">{PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS]}</p>
          </div>
          <div>
            <p className="text-ink-muted">Loyer mensuel</p>
            <p className="font-medium text-ink">{formatXOF(property.rentAmount)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Surface</p>
            <p className="font-medium text-ink">{property.surfaceM2 ? `${property.surfaceM2} m²` : "—"}</p>
          </div>
          <div>
            <p className="text-ink-muted">Propriétaire</p>
            <p className="font-medium text-ink">{property.owner?.fullName}</p>
          </div>
        </div>

        {property.description && <p className="mt-4 text-sm text-ink-muted">{property.description}</p>}
      </Card>
    </div>
  );
}
