"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Phone } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { MAINTENANCE_ISSUE_LABELS, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { MaintenancePhotos, MaintenanceThread, timeLabel } from "@/components/maintenance/maintenance-thread";
import { t as tr } from "@/lib/t-spaces";

interface UpdateForm {
  status: string;
  technicianId?: string;
  estimatedCost?: number;
  finalCost?: number;
  adminComment?: string;
}

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => (await api.get(`/maintenance/${id}`)).data,
  });

  const { data: technicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => (await api.get("/technicians")).data,
  });

  const { register, handleSubmit } = useForm<UpdateForm>();

  const updateMutation = useMutation({
    // "Aucun" technicien = chaîne vide côté formulaire : on envoie null (désassigner), et null pour un coût vide.
    mutationFn: (v: UpdateForm) =>
      api.patch(`/maintenance/${id}`, {
        ...v,
        technicianId: v.technicianId || null,
        estimatedCost: Number.isFinite(v.estimatedCost) ? v.estimatedCost : null,
        finalCost: Number.isFinite(v.finalCost) ? v.finalCost : null,
      }),
    onSuccess: () => {
      toast.success(tr("Demande mise à jour. Le locataire est prévenu."));
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !request) return <LoadingState />;

  return (
    <div>
      <Link href="/admin/maintenance" className="mb-4 flex w-fit items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" />{" "}{tr("Retour")}
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-4 lg:col-span-2">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-ink">
                {tr(MAINTENANCE_ISSUE_LABELS[request.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS])}
              </h1>
              <MaintenanceStatusBadge status={request.status} />
            </div>
            <p className="text-sm text-ink-muted">
              {tr("{0} · Signalé par {1} le {2} · Priorité", request.property?.name, request.tenant?.fullName, timeLabel(request.createdAt))}{" "}
              {tr(MAINTENANCE_PRIORITY_LABELS[request.priority as keyof typeof MAINTENANCE_PRIORITY_LABELS])}
            </p>
            {request.tenant?.phone && (
              <a href={`tel:${request.tenant.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" />{" "}{tr("Appeler le locataire ({0})", request.tenant.phone)}
              </a>
            )}
            <p className="mt-4 whitespace-pre-line text-sm text-ink">{request.description}</p>
            <MaintenancePhotos photos={request.photos} />
          </Card>

          <MaintenanceThread requestId={id} comments={request.comments} />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <Card>
          <CardHeader title={tr("Traitement")} />
          <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="space-y-3">
            <div>
              <Label htmlFor="mt-status">{tr("Statut")}</Label>
              <Select id="mt-status" defaultValue={request.status} {...register("status")}>
                <option value="RECU">{tr("Reçu")}</option>
                <option value="EN_COURS">{tr("En cours")}</option>
                <option value="RESOLU">{tr("Résolu")}</option>
                <option value="REJETE">{tr("Rejeté")}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="mt-tech">{tr("Technicien assigné")}</Label>
              <Select id="mt-tech" defaultValue={request.technicianId ?? ""} {...register("technicianId")}>
                <option value="">{tr("Aucun")}</option>
                {technicians?.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="mt-est">{tr("Coût estimé (FCFA)")}</Label>
              <Input id="mt-est" type="number" min={0} defaultValue={request.estimatedCost ?? ""} {...register("estimatedCost", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="mt-final">{tr("Coût final (FCFA)")}</Label>
              <Input id="mt-final" type="number" min={0} defaultValue={request.finalCost ?? ""} {...register("finalCost", { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="mt-note">{tr("Note visible par le locataire et le propriétaire")}</Label>
              <Textarea id="mt-note" rows={2} defaultValue={request.adminComment ?? ""} {...register("adminComment")} />
            </div>
            <Button type="submit" className="w-full" loading={updateMutation.isPending}>
              {tr("Mettre à jour")}
            </Button>
          </form>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
