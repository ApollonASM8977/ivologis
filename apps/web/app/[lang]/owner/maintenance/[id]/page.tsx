"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, Wrench, MapPin, Banknote, Clock, HardHat } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF, MAINTENANCE_ISSUE_LABELS, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { MaintenancePhotos, MaintenanceThread, timeLabel } from "@/components/maintenance/maintenance-thread";

export default function OwnerMaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: request, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => (await api.get(`/maintenance/${id}`)).data,
  });

  if (isLoading || !request) return <LoadingState />;

  return (
    <div>
      <button onClick={() => router.push("/owner/maintenance")} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold text-ink">
                <Wrench className="h-5 w-5 text-primary" />
                {MAINTENANCE_ISSUE_LABELS[request.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS]}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                <MapPin className="h-3.5 w-3.5" /> {request.property?.name} · Signalé par {request.tenant?.fullName} · Priorité{" "}
                {MAINTENANCE_PRIORITY_LABELS[request.priority as keyof typeof MAINTENANCE_PRIORITY_LABELS]}
              </p>
            </div>
            <MaintenanceStatusBadge status={request.status} />
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink">{request.description}</p>
          <MaintenancePhotos photos={request.photos} />
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MaintenanceThread requestId={id} comments={request.comments} className="lg:col-span-2" />

        <StaggerContainer className="space-y-4">
          <StaggerItem>
            <Card>
              <CardHeader title="Coûts" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-muted">
                    <Banknote className="h-4 w-4" /> Coût estimé
                  </span>
                  <span className="font-medium text-ink">{request.estimatedCost ? formatXOF(request.estimatedCost) : "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-muted">
                    <Banknote className="h-4 w-4" /> Coût final
                  </span>
                  <span className="font-medium text-ink">{request.finalCost ? formatXOF(request.finalCost) : "-"}</span>
                </div>
              </div>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardHeader title="Suivi" />
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <div>
                    <p className="font-medium text-ink">Demande reçue</p>
                    <p className="text-xs text-ink-muted">{timeLabel(request.createdAt)}</p>
                  </div>
                </li>
                {request.technician && (
                  <li className="flex items-start gap-2">
                    <HardHat className="mt-0.5 h-4 w-4 text-ink-muted" />
                    <div>
                      <p className="font-medium text-ink">Intervenant : {request.technician.fullName}</p>
                      {request.technician.specialty && <p className="text-xs text-ink-muted">{request.technician.specialty}</p>}
                    </div>
                  </li>
                )}
                {request.resolvedAt && (
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-success" />
                    <div>
                      <p className="font-medium text-ink">Résolue</p>
                      <p className="text-xs text-ink-muted">{timeLabel(request.resolvedAt)}</p>
                    </div>
                  </li>
                )}
                {request.adminComment && (
                  <li className="rounded-lg bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">Note de l&apos;agence</p>
                    <p className="mt-1 text-ink">{request.adminComment}</p>
                  </li>
                )}
              </ol>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}
