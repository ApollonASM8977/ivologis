"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Clock, HardHat, Wrench } from "lucide-react";
import { api } from "@/lib/api";
import { MAINTENANCE_ISSUE_LABELS, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { MaintenancePhotos, MaintenanceThread, timeLabel } from "@/components/maintenance/maintenance-thread";

export default function TenantMaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: request, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => (await api.get(`/maintenance/${id}`)).data,
  });

  if (isLoading || !request) return <LoadingState />;

  const steps = [
    { done: true, icon: Clock, label: "Demande reçue par l'agence", date: request.createdAt },
    { done: !!request.technician || request.status !== "RECU", icon: HardHat, label: request.technician ? `Intervenant : ${request.technician.fullName}` : "Prise en charge", date: null },
    { done: request.status === "RESOLU", icon: CheckCircle2, label: request.status === "REJETE" ? "Demande non retenue" : "Problème résolu", date: request.resolvedAt },
  ];

  return (
    <div>
      <Link href="/tenant/maintenance" className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Mes demandes
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold text-ink">
                <Wrench className="h-5 w-5 text-primary" />
                {MAINTENANCE_ISSUE_LABELS[request.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS]}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {request.property?.name} · Priorité {MAINTENANCE_PRIORITY_LABELS[request.priority as keyof typeof MAINTENANCE_PRIORITY_LABELS]?.toLowerCase()}
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
              <CardHeader title="Suivi" />
              <ol className="relative space-y-4 border-l border-gray-200 pl-6">
                {steps.map((s, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="relative">
                    <span
                      className={`absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${s.done ? "bg-success text-white" : "bg-gray-200 text-ink-muted"}`}
                    >
                      <s.icon className="h-3 w-3" />
                    </span>
                    <p className={`text-sm font-medium ${s.done ? "text-ink" : "text-ink-muted"}`}>{s.label}</p>
                    {s.date && <p className="text-xs text-ink-muted">{timeLabel(s.date)}</p>}
                  </motion.li>
                ))}
              </ol>
            </Card>
          </StaggerItem>
          {request.adminComment && (
            <StaggerItem>
              <Card className="bg-primary/5">
                <p className="text-xs font-semibold text-primary">Note de l&apos;agence</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink">{request.adminComment}</p>
              </Card>
            </StaggerItem>
          )}
        </StaggerContainer>
      </div>
    </div>
  );
}
