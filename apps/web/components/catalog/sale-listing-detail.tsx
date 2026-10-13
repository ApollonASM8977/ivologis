"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Ruler, Tag, CalendarCheck } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";

interface VisitForm {
  preferredDate?: string;
  message?: string;
}

export function SaleListingDetail({ id }: { id: string }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<VisitForm>();

  const { data: property, isLoading } = useQuery({
    queryKey: ["catalog", "sales", id],
    queryFn: async () => (await api.get(`/catalog/sales/${id}`)).data,
  });

  const mutation = useMutation({
    mutationFn: (values: VisitForm) => api.post(`/properties/${id}/visit-requests`, values),
    onSuccess: () => {
      toast.success("Demande de rendez-vous envoyée. L'agence vous recontactera.");
      setModalOpen(false);
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !property) return <LoadingState />;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </button>

      {!!property.images?.length && (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {property.images.map((img: any) => (
            <div key={img.id} className="relative h-28 overflow-hidden rounded-lg bg-gray-100">
              <Image src={fileUrl(img.url) ?? ""} alt={property.name} fill sizes="200px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">{property.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" /> {property.address}, {property.commune}
          </p>
        </div>
        <p className="text-2xl font-bold text-primary">{formatXOF(Number(property.salePrice ?? 0))}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs uppercase text-ink-muted">Type</p>
          <p className="mt-1 text-sm font-semibold text-ink">{PROPERTY_TYPE_LABELS[property.type as keyof typeof PROPERTY_TYPE_LABELS]}</p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs uppercase text-ink-muted">
            <Ruler className="h-3.5 w-3.5" /> Surface
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.surfaceM2 ? `${property.surfaceM2} m²` : "-"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-ink-muted">Propriétaire</p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.owner?.fullName ?? "-"}</p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs uppercase text-ink-muted">
            <Tag className="h-3.5 w-3.5" /> Repère
          </p>
          <p className="mt-1 text-sm font-semibold text-ink">{property.landmark ?? "-"}</p>
        </Card>
      </div>

      {property.description && (
        <Card className="mt-4">
          <CardHeader title="Description" />
          <p className="text-sm leading-relaxed text-ink-muted">{property.description}</p>
        </Card>
      )}

      {!!property.amenities?.length && (
        <Card className="mt-4">
          <CardHeader title="Équipements" />
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a: string) => (
              <span key={a} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {a}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Button className="mt-6" onClick={() => setModalOpen(true)}>
        <CalendarCheck className="h-4 w-4" /> Prendre rendez-vous pour visiter
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Demande de visite">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
          <p className="text-sm text-ink-muted">L&apos;agence vous recontactera pour confirmer une date de visite.</p>
          <div>
            <Label>Date souhaitée (optionnel)</Label>
            <Input type="date" {...register("preferredDate")} />
          </div>
          <div>
            <Label>Message (optionnel)</Label>
            <Textarea rows={3} placeholder="Précisez vos disponibilités ou vos questions..." {...register("message")} />
          </div>
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Envoyer la demande
          </Button>
        </form>
      </Modal>
    </div>
  );
}
