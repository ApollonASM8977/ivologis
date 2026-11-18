"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ChevronRight, ImageIcon, MessageSquare, Plus, Wrench } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { MAINTENANCE_ISSUE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
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
      toast.success("Votre demande a été envoyée à l'agence.");
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
        subtitle="Signalez un problème et suivez son traitement"
        action={
          property && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Nouvelle demande
            </Button>
          )
        }
      />

      {data?.data?.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Aucune demande"
          description="Fuite, panne électrique, serrure… signalez-le ici avec une photo : l'agence est prévenue immédiatement."
          action={property && <Button onClick={() => setModalOpen(true)}>Nouvelle demande</Button>}
        />
      ) : (
        <StaggerContainer className="space-y-3">
          {(data?.data ?? []).map((m: any) => (
            <StaggerItem key={m.id}>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/tenant/maintenance/${m.id}`}
                  className="group flex items-start justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{MAINTENANCE_ISSUE_LABELS[m.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS]}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{m.description}</p>
                    <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                      <span>{new Date(m.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</span>
                      {m.technician && <span>Intervenant : {m.technician.fullName}</span>}
                      {!!m.photos?.length && (
                        <span className="inline-flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" /> {m.photos.length}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-primary">
                        <MessageSquare className="h-3.5 w-3.5" /> Suivre et échanger
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <MaintenanceStatusBadge status={m.status} />
                    <ChevronRight className="h-4 w-4 text-ink-muted transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouvelle demande de maintenance">
        <MaintenanceForm loading={createMutation.isPending} onSubmit={(v) => createMutation.mutate(v)} />
      </Modal>
    </div>
  );
}
