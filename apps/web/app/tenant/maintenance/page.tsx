"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Wrench } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { MAINTENANCE_ISSUE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { MaintenanceForm, MaintenanceFormValues } from "@/components/maintenance/maintenance-form";

export default function TenantMaintenancePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ["properties", "me"],
    queryFn: async () => (await api.get("/properties/me")).data,
  });
  const property = properties?.[0];

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance", "mine"],
    queryFn: async () => (await api.get("/maintenance", { params: { limit: 20 } })).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: MaintenanceFormValues) => api.post("/maintenance", { ...values, propertyId: property.id }),
    onSuccess: () => {
      toast.success("Votre demande a été envoyée.");
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle="Suivez vos demandes d'intervention"
        action={
          property && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Nouvelle demande
            </Button>
          )
        }
      />

      {data?.data?.length === 0 ? (
        <EmptyState icon={Wrench} title="Aucune demande" action={property && <Button onClick={() => setModalOpen(true)}>Nouvelle demande</Button>} />
      ) : (
        <div className="space-y-3">
          {(data?.data ?? []).map((m: any) => (
            <Card key={m.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{MAINTENANCE_ISSUE_LABELS[m.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS]}</p>
                  <p className="mt-1 text-sm text-ink-muted">{m.description}</p>
                  <p className="mt-2 text-xs text-ink-muted">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <MaintenanceStatusBadge status={m.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle demande de maintenance">
        <MaintenanceForm loading={createMutation.isPending} onSubmit={(v) => createMutation.mutate(v)} />
      </Modal>
    </div>
  );
}
