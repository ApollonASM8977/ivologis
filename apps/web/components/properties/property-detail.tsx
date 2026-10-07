"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Archive, MapPin, Pencil, Image as ImageIcon, X, Sofa } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { LoadingState } from "@/components/ui/empty-state";
import { PropertyStatusBadge, PaymentStatusBadge, MaintenanceStatusBadge } from "@/components/status-badges";
import { PropertyForm, PropertyFormValues } from "@/components/properties/property-form";

export function PropertyDetail({ id, listHref }: { id: string; listHref: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ["properties", id],
    queryFn: async () => (await api.get(`/properties/${id}`)).data,
  });

  const updateMutation = useMutation({
    mutationFn: (values: Partial<PropertyFormValues>) => api.patch(`/properties/${id}`, values),
    onSuccess: () => {
      toast.success("Bien mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
      setEditOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.delete(`/properties/${id}`),
    onSuccess: () => {
      toast.success("Bien archivé.");
      router.push(listHref);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const hasNoCover = !property?.images?.some((img: any) => img.isCover);
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("isCover", hasNoCover && i === 0 ? "true" : "false");
        await api.post(`/properties/${id}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      toast.success("Photo(s) ajoutée(s).");
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => api.delete(`/properties/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !property) return <LoadingState />;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-ink">{property.name}</h1>
            <PropertyStatusBadge status={property.status} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" /> {property.address}, {property.commune}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Modifier
          </Button>
          <Button size="sm" variant="danger" onClick={() => archiveMutation.mutate()} loading={archiveMutation.isPending}>
            <Archive className="h-4 w-4" /> Archiver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Type</p>
          <p className="mt-1 text-sm font-semibold text-ink">{PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS]}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Propriétaire</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.owner?.fullName}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Locataire actuel</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.currentTenant?.fullName ?? "Aucun"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Loyer mensuel</p>
          <p className="mt-1 text-sm font-semibold text-ink">{formatXOF(property.rentAmount)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Caution</p>
          <p className="mt-1 text-sm font-semibold text-ink">{formatXOF(property.deposit)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Surface</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.surfaceM2 ? `${property.surfaceM2} m²` : "-"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Étage</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.floor !== null && property.floor !== undefined ? (property.floor === 0 ? "Rez-de-chaussée" : `${property.floor}e étage`) : "-"}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-ink-muted">Année de construction</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.yearBuilt ?? "-"}</p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs font-medium uppercase text-ink-muted"><Sofa className="h-3.5 w-3.5" /> Meublé</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.furnished ? "Oui" : "Non"}</p>
        </Card>
        {property.landmark && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium uppercase text-ink-muted">Repère</p>
            <p className="mt-1 text-sm font-semibold text-ink">{property.landmark}</p>
          </Card>
        )}
      </div>

      {!!property.amenities?.length && (
        <Card className="mt-4">
          <CardHeader title="Équipements" />
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a: string) => (
              <Badge key={a} color="blue">{a}</Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader
          title="Photos"
          action={
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files?.length && uploadMutation.mutate(e.target.files)}
              />
              + Ajouter des photos
            </label>
          }
        />
        {property.images?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {property.images.map((img: any) => (
              <div key={img.id} className="group relative h-32 overflow-hidden rounded-lg">
                <Image src={fileUrl(img.url) ?? ""} alt={property.name} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
                {img.isCover && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Couverture
                  </span>
                )}
                <button
                  onClick={() => deleteImageMutation.mutate(img.id)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Supprimer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <ImageIcon className="h-4 w-4" /> Aucune photo pour ce bien.
          </div>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Historique des paiements" />
          <div className="space-y-2">
            {property.payments?.length ? (
              property.payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                  <span>{new Date(p.paymentDate).toLocaleDateString("fr-FR")}</span>
                  <span className="font-medium">{formatXOF(p.amount)}</span>
                  <PaymentStatusBadge status={p.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-muted">Aucun paiement enregistré.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Historique de maintenance" />
          <div className="space-y-2">
            {property.maintenanceRequests?.length ? (
              property.maintenanceRequests.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0">
                  <span className="line-clamp-1">{m.description}</span>
                  <MaintenanceStatusBadge status={m.status} />
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-muted">Aucune demande de maintenance.</p>
            )}
          </div>
        </Card>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier le bien" width="max-w-2xl">
        <PropertyForm
          defaultValues={property}
          loading={updateMutation.isPending}
          submitLabel="Mettre à jour"
          onSubmit={(values) => updateMutation.mutate(values)}
        />
      </Modal>
    </div>
  );
}
