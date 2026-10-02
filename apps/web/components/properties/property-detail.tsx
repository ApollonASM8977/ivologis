"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Archive, MapPin, Pencil, Image as ImageIcon } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
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
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("isCover", "true");
      return api.post(`/properties/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Image ajoutée.");
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
          <p className="mt-1 text-sm font-semibold text-ink">{property.surfaceM2 ? `${property.surfaceM2} m²` : "—"}</p>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Photos"
          action={
            <label className="cursor-pointer text-sm font-medium text-primary hover:underline">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])}
              />
              + Ajouter une photo
            </label>
          }
        />
        {property.images?.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {property.images.map((img: any) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={img.id} src={fileUrl(img.url)} alt={property.name} className="h-32 w-full rounded-lg object-cover" />
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
