"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, FileText, FileType, XCircle, RefreshCw } from "lucide-react";
import { api, apiErrorMessage, openDocument } from "@/lib/api";
import { formatXOF, LEASE_TYPE_LABELS } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";
import { LeaseForm, LeaseFormValues } from "@/components/leases/lease-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface RenewFormValues {
  newEndDate: string;
  newRentAmount?: number;
}

interface LeaseRow {
  id: string;
  contractNumber: string;
  type: keyof typeof LEASE_TYPE_LABELS;
  property: { name: string };
  tenant: { fullName: string };
  owner: { fullName: string };
  rentAmount: number;
  status: any;
  documentUrl?: string | null;
  wordUrl?: string | null;
}

export default function AdminLeasesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<LeaseRow | null>(null);
  const [terminateTarget, setTerminateTarget] = useState<LeaseRow | null>(null);
  const { register: registerRenew, handleSubmit: handleRenewSubmit, reset: resetRenew } = useForm<RenewFormValues>();

  const { data, isLoading } = useQuery({
    queryKey: ["leases", page],
    queryFn: async () => (await api.get("/leases", { params: { page, limit: 10 } })).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: LeaseFormValues) => api.post("/leases", values),
    onSuccess: () => {
      toast.success("Contrat créé avec succès.");
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const documentMutation = useMutation({
    mutationFn: ({ id, format }: { id: string; format: "pdf" | "docx" }) =>
      api.post(`/leases/${id}/document`, null, { params: { format } }),
    onSuccess: (res, variables) => {
      toast.success(variables.format === "docx" ? "Document Word généré." : "Document PDF généré.");
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      const url = variables.format === "docx" ? res.data.wordUrl : res.data.documentUrl;
      openDocument(url).catch((e) => toast.error(apiErrorMessage(e)));
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const terminateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/leases/${id}/terminate`),
    onSuccess: () => {
      toast.success("Contrat résilié.");
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const renewMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: RenewFormValues }) =>
      api.post(`/leases/${id}/renew`, values),
    onSuccess: () => {
      toast.success("Contrat renouvelé.");
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      setRenewTarget(null);
      resetRenew();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<LeaseRow>[] = [
    { header: "N° Contrat", cell: (r) => <Link href={`/admin/leases/${r.id}`} className="font-mono text-xs font-semibold text-primary hover:underline">{r.contractNumber}</Link> },
    { header: "Type", cell: (r) => <Badge color="blue">{LEASE_TYPE_LABELS[r.type]}</Badge> },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Propriétaire", cell: (r) => r.owner?.fullName },
    { header: "Loyer", cell: (r) => formatXOF(r.rentAmount) },
    { header: "Statut", cell: (r) => <LeaseStatusBadge status={r.status} /> },
    {
      header: "Document",
      cell: (r) => (
        <div className="flex gap-1">
          <button
            title="Générer le contrat en PDF"
            onClick={() => documentMutation.mutate({ id: r.id, format: "pdf" })}
            className="rounded px-1.5 py-1 text-xs font-medium text-ink-muted hover:bg-gray-100 hover:text-primary"
          >
            PDF
          </button>
          <button
            title="Générer le contrat en Word"
            onClick={() => documentMutation.mutate({ id: r.id, format: "docx" })}
            className="flex items-center gap-1 rounded px-1.5 py-1 text-xs font-medium text-ink-muted hover:bg-gray-100 hover:text-primary"
          >
            <FileType className="h-3.5 w-3.5" /> Word
          </button>
          {r.status === "ACTIVE" && (
            <>
              <button
                title="Renouveler le contrat"
                onClick={() => {
                  setRenewTarget(r);
                  resetRenew({ newRentAmount: r.rentAmount });
                }}
                className="rounded p-1.5 text-ink-muted hover:bg-green-50 hover:text-success"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                title="Résilier le contrat"
                onClick={() => setTerminateTarget(r)}
                className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-danger"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contrats de bail"
        subtitle="Habitation, commercial, professionnel ou terrain, avec génération PDF et Word"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Nouveau contrat
          </Button>
        }
      />

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={FileText} title="Aucun contrat" action={<Button onClick={() => setModalOpen(true)}>Créer un contrat</Button>} />
      ) : (
        <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} rowKey={(r) => r.id} page={page} limit={10} total={data?.total} onPageChange={setPage} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau contrat de bail" width="max-w-2xl">
        <LeaseForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>

      <ConfirmDialog
        open={!!terminateTarget}
        danger
        title="Résilier le contrat"
        message={`Le bail ${terminateTarget?.contractNumber ?? ""} sera résilié et le bien repassera en vacant. Cette action est tracée dans le journal d'activité.`}
        confirmLabel="Résilier le contrat"
        loading={terminateMutation.isPending}
        onClose={() => setTerminateTarget(null)}
        onConfirm={() => terminateTarget && terminateMutation.mutate(terminateTarget.id, { onSettled: () => setTerminateTarget(null) })}
      />

      <Modal
        open={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        title={`Renouveler le contrat ${renewTarget?.contractNumber ?? ""}`}
      >
        <form
          onSubmit={handleRenewSubmit((values) => renewTarget && renewMutation.mutate({ id: renewTarget.id, values }))}
          className="space-y-4"
        >
          <div>
            <Label>Nouvelle date de fin</Label>
            <Input type="date" {...registerRenew("newEndDate", { required: true })} />
          </div>
          <div>
            <Label>Nouveau loyer (optionnel)</Label>
            <Input type="number" {...registerRenew("newRentAmount", { valueAsNumber: true })} />
          </div>
          <Button type="submit" className="w-full" loading={renewMutation.isPending}>
            Renouveler le contrat
          </Button>
        </form>
      </Modal>
    </div>
  );
}
