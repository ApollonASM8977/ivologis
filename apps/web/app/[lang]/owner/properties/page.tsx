"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Building2, MapPin } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { formatXOF, PROPERTY_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

/** Le bon prix selon l'usage du bien : un terrain en vente n'a pas de loyer. */
function priceLabel(p: any) {
  if (Number(p.rentAmount) > 0) return `${formatXOF(p.rentAmount)} / mois`;
  if (p.forSale && Number(p.salePrice) > 0) return `En vente : ${formatXOF(p.salePrice)}`;
  if (p.shortStayEnabled && Number(p.shortStayNightlyRate) > 0) return `${formatXOF(p.shortStayNightlyRate)} / nuit`;
  return "Prix à définir avec l'agence";
}
import { PropertyStatusBadge } from "@/components/status-badges";
import { PropertyForm, PropertyFormValues } from "@/components/properties/property-form";

export default function OwnerPropertiesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  // Sans la permission accordée par l'agence, l'API refuse la création : on ne propose pas un formulaire voué à l'échec.
  const canCreate = useAuthStore((s) => !!s.user?.permissions?.includes("properties.manage"));

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
          canCreate ? (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Ajouter un bien
            </Button>
          ) : undefined
        }
      />

      {!canCreate && (
        <p className="mb-4 rounded-lg bg-surface px-4 py-3 text-sm text-ink-muted">
          Pour confier un nouveau bien à l&apos;agence (location, vente ou séjours), contactez-la : elle crée la fiche et vérifie les documents avant toute publication.
        </p>
      )}

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Vous n'avez aucun bien"
          action={canCreate ? <Button onClick={() => setModalOpen(true)}>Ajouter un bien</Button> : undefined}
        />
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />)}
          {(data?.data ?? []).map((p: any) => {
            const cover = p.images?.[0]?.url;
            return (
              <StaggerItem key={p.id}>
                <motion.button
                  type="button"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/owner/properties/${p.id}`)}
                  className="group block w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-36 bg-gradient-to-br from-primary/10 to-primary/5">
                    {cover ? (
                      <Image src={fileUrl(cover) ?? ""} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <Building2 className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-primary/30" />
                    )}
                    <span className="absolute right-3 top-3">
                      <PropertyStatusBadge status={p.status} />
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-medium text-ink">{p.name}</p>
                    <p className="flex items-center gap-1 text-xs text-ink-muted">
                      <MapPin className="h-3 w-3" /> {p.commune} · {PROPERTY_TYPE_LABELS[p.type as keyof typeof PROPERTY_TYPE_LABELS]}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary">{priceLabel(p)}</p>
                    {p.currentTenant && <p className="mt-1 text-xs text-ink-muted">Locataire : {p.currentTenant.fullName}</p>}
                  </div>
                </motion.button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un bien" width="max-w-2xl">
        <PropertyForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>
    </div>
  );
}
