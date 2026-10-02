"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Building2, MapPin } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyStatusBadge } from "@/components/status-badges";
import { PropertyForm, PropertyFormValues } from "@/components/properties/property-form";

export default function OwnerPropertiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", "mine"],
    queryFn: async () => (await api.get("/properties", { params: { limit: 50 } })).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: PropertyFormValues) => api.post("/properties", values),
    onSuccess: () => {
      toast.success("Bien ajouté avec succès.");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader
        title="Mes biens"
        subtitle="Gérez vos biens immobiliers"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un bien
          </Button>
        }
      />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Building2} title="Vous n'avez aucun bien" action={<Button onClick={() => setModalOpen(true)}>Ajouter un bien</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data ?? []).map((p: any) => (
            <Card key={p.id} onClick={() => router.push(`/owner/properties/${p.id}`)} className="cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin className="h-3 w-3" /> {p.commune}
                  </p>
                </div>
                <PropertyStatusBadge status={p.status} />
              </div>
              <p className="mt-3 text-xs text-ink-muted">{PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS]}</p>
              <p className="mt-1 text-sm font-semibold text-primary">{formatXOF(p.rentAmount)}/mois</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un bien" width="max-w-2xl">
        <PropertyForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>
    </div>
  );
}
