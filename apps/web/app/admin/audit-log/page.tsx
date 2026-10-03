"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, ShieldAlert, UserPlus, KeyRound, FileX, FileCheck, Archive, LogIn, UserCheck } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

interface AuditRow {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: { fullName: string; role: string } | null;
}

const ACTION_META: Record<string, { label: string; color: string; icon: typeof History }> = {
  REGISTER: { label: "Inscription", color: "blue", icon: UserCheck },
  LOGIN: { label: "Connexion", color: "gray", icon: LogIn },
  CREATE_ADMIN: { label: "Création agent", color: "green", icon: UserPlus },
  UPDATE_USER_STATUS: { label: "Statut compte modifié", color: "amber", icon: ShieldAlert },
  UPDATE_PERMISSIONS: { label: "Permissions modifiées", color: "blue", icon: KeyRound },
  RENEW_LEASE: { label: "Contrat renouvelé", color: "green", icon: FileCheck },
  TERMINATE_LEASE: { label: "Contrat résilié", color: "red", icon: FileX },
  ARCHIVE_PROPERTY: { label: "Bien archivé", color: "red", icon: Archive },
};

function describeMetadata(row: AuditRow): string {
  const m = row.metadata;
  if (!m) return "—";
  switch (row.action) {
    case "CREATE_ADMIN":
      return `${m.fullName ?? ""} — ${(m.permissions as string[])?.length ?? 0} permission(s)`;
    case "UPDATE_USER_STATUS":
      return `${m.fullName ?? ""} : ${m.previousStatus ?? "?"} → ${m.newStatus ?? "?"}`;
    case "UPDATE_PERMISSIONS":
      return `${m.fullName ?? ""} — ${(m.permissions as string[])?.length ?? 0} permission(s) accordée(s)`;
    case "RENEW_LEASE":
      return `${m.contractNumber ?? ""} — nouvelle échéance ${m.newEndDate ?? ""}`;
    case "TERMINATE_LEASE":
      return `${m.contractNumber ?? ""}`;
    case "ARCHIVE_PROPERTY":
      return `${m.name ?? ""}`;
    default:
      return "";
  }
}

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: async () => (await api.get("/audit-logs", { params: { page, limit: 25 } })).data,
  });

  const rows: AuditRow[] = (data?.data ?? []).filter((r: AuditRow) => !action || r.action === action);

  const columns: Column<AuditRow>[] = [
    {
      header: "Date",
      cell: (r) =>
        new Date(r.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }),
    },
    { header: "Auteur", cell: (r) => r.user?.fullName ?? "Système" },
    {
      header: "Action",
      cell: (r) => {
        const meta = ACTION_META[r.action] ?? { label: r.action, color: "gray", icon: History };
        const Icon = meta.icon;
        return (
          <Badge color={meta.color}>
            <Icon className="mr-1 h-3 w-3" /> {meta.label}
          </Badge>
        );
      },
    },
    { header: "Entité", cell: (r) => r.entityType },
    { header: "Détails", cell: (r) => <span className="text-ink-muted">{describeMetadata(r)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Journal d'activité"
        subtitle="Historique des actions sensibles effectuées sur la plateforme"
      />

      <div className="mb-4 flex gap-3">
        <Select className="w-64" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </Select>
      </div>

      {!isLoading && rows.length === 0 ? (
        <EmptyState icon={History} title="Aucune activité enregistrée" />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          loading={isLoading}
          rowKey={(r) => r.id}
          page={page}
          limit={25}
          total={data?.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
