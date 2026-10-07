"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, UserCog, ShieldCheck, Ban, CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { PERMISSION_KEYS, PERMISSION_LABELS, PermissionKey } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountStatusBadge } from "@/components/status-badges";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";

interface AdminRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: any;
  permissions: { permission: { key: string; label: string } }[];
}

interface CreateAdminForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const ALL_PERMISSIONS = Object.values(PERMISSION_KEYS) as PermissionKey[];

function PermissionChecklist({
  selected,
  onToggle,
}: {
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {ALL_PERMISSIONS.map((key) => (
        <label
          key={key}
          className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm hover:bg-gray-50"
        >
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={selected.has(key)}
            onChange={() => onToggle(key)}
          />
          {PERMISSION_LABELS[key]}
        </label>
      ))}
    </div>
  );
}

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [permissionsFor, setPermissionsFor] = useState<AdminRow | null>(null);
  const [newAgentPermissions, setNewAgentPermissions] = useState<Set<string>>(new Set());
  const [editPermissions, setEditPermissions] = useState<Set<string>>(new Set());

  const { data: admins, isLoading } = useQuery({
    queryKey: ["users", "admins"],
    queryFn: async () => (await api.get("/users/admins")).data,
  });

  const { register, handleSubmit, reset, watch } = useForm<CreateAdminForm>();
  const newAdminPassword = watch("password");

  const createMutation = useMutation({
    mutationFn: (values: CreateAdminForm) =>
      api.post("/users/admins", { ...values, permissions: Array.from(newAgentPermissions) }),
    onSuccess: () => {
      toast.success("Agent créé avec succès.");
      queryClient.invalidateQueries({ queryKey: ["users", "admins"] });
      setCreateOpen(false);
      reset();
      setNewAgentPermissions(new Set());
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/users/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Statut mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["users", "admins"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const permissionsMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) =>
      api.patch(`/users/${id}/permissions`, { permissions }),
    onSuccess: () => {
      toast.success("Permissions mises à jour.");
      queryClient.invalidateQueries({ queryKey: ["users", "admins"] });
      setPermissionsFor(null);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function openPermissions(row: AdminRow) {
    setPermissionsFor(row);
    setEditPermissions(new Set(row.permissions.map((p) => p.permission.key)));
  }

  function toggle(set: Set<string>, setter: (s: Set<string>) => void, key: string) {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  }

  const columns: Column<AdminRow>[] = [
    { header: "Nom", cell: (r) => <span className="font-medium text-ink">{r.fullName}</span> },
    { header: "Email", cell: (r) => r.email },
    { header: "Téléphone", cell: (r) => r.phone },
    { header: "Permissions", cell: (r) => `${r.permissions.length} / ${ALL_PERMISSIONS.length}` },
    { header: "Statut", cell: (r) => <AccountStatusBadge status={r.status} /> },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex gap-1">
          <button
            title="Gérer les permissions"
            onClick={() => openPermissions(r)}
            className="rounded p-1.5 text-ink-muted hover:bg-gray-100 hover:text-primary"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>
          <button
            title={r.status === "SUSPENDED" ? "Réactiver" : "Suspendre"}
            onClick={() =>
              statusMutation.mutate({ id: r.id, status: r.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" })
            }
            className={`rounded p-1.5 hover:bg-gray-100 ${r.status === "SUSPENDED" ? "text-success" : "text-ink-muted hover:text-danger"}`}
          >
            {r.status === "SUSPENDED" ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Équipe"
        subtitle="Agents immobiliers (admins secondaires) et leurs permissions"
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un agent
          </Button>
        }
      />

      {!isLoading && admins?.length === 0 ? (
        <EmptyState icon={UserCog} title="Aucun agent" description="Créez un compte pour vos agents immobiliers." action={<Button onClick={() => setCreateOpen(true)}>Ajouter un agent</Button>} />
      ) : (
        <DataTable columns={columns} rows={admins ?? []} loading={isLoading} rowKey={(r) => r.id} />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Ajouter un agent immobilier" width="max-w-xl">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <Label>Nom complet</Label>
            <Input {...register("fullName", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email", { required: true })} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input {...register("phone", { required: true })} />
            </div>
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input type="password" {...register("password", { required: true, minLength: 8 })} />
            <PasswordStrengthMeter password={newAdminPassword} />
          </div>
          <div>
            <Label>Permissions accordées</Label>
            <PermissionChecklist
              selected={newAgentPermissions}
              onToggle={(key) => toggle(newAgentPermissions, setNewAgentPermissions, key)}
            />
          </div>
          <Button type="submit" className="w-full" loading={createMutation.isPending}>
            Créer l&apos;agent
          </Button>
        </form>
      </Modal>

      <Modal
        open={!!permissionsFor}
        onClose={() => setPermissionsFor(null)}
        title={`Permissions de ${permissionsFor?.fullName ?? ""}`}
        width="max-w-xl"
      >
        <PermissionChecklist selected={editPermissions} onToggle={(key) => toggle(editPermissions, setEditPermissions, key)} />
        <Button
          className="mt-4 w-full"
          loading={permissionsMutation.isPending}
          onClick={() =>
            permissionsFor &&
            permissionsMutation.mutate({ id: permissionsFor.id, permissions: Array.from(editPermissions) })
          }
        >
          Enregistrer les permissions
        </Button>
      </Modal>
    </div>
  );
}
