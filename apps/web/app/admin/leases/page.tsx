"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, FileText, Download, XCircle } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";
import { LeaseForm, LeaseFormValues } from "@/components/leases/lease-form";

interface LeaseRow {
  id: string;
  contractNumber: string;
  property: { name: string };
  tenant: { fullName: string };
  owner: { fullName: string };
  rentAmount: number;
  status: any;
  documentUrl?: string | null;
}

export default function AdminLeasesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

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

  const pdfMutation = useMutation({
    mutationFn: (id: string) => api.post(`/leases/${id}/pdf`),
    onSuccess: (res) => {
      toast.success("PDF généré.");
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      window.open(fileUrl(res.data.documentUrl), "_blank");
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

  const columns: Column<LeaseRow>[] = [
    { header: "N° Contrat", cell: (r) => <span className="font-mono text-xs">{r.contractNumber}</span> },
    { header: "Bien", cell: (r) => r.property?.name },
    { header: "Locataire", cell: (r) => r.tenant?.fullName },
    { header: "Propriétaire", cell: (r) => r.owner?.fullName },
    { header: "Loyer", cell: (r) => formatXOF(r.rentAmount) },
    { header: "Statut", cell: (r) => <LeaseStatusBadge status={r.status} /> },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex gap-1">
          <button
            title="Générer / télécharger le PDF"
            onClick={() => (r.documentUrl ? window.open(fileUrl(r.documentUrl), "_blank") : pdfMutation.mutate(r.id))}
            className="rounded p-1.5 text-ink-muted hover:bg-gray-100 hover:text-primary"
          >
            <Download className="h-4 w-4" />
          </button>
          {r.status === "ACTIVE" && (
            <button
              title="Résilier le contrat"
              onClick={() => confirm("Résilier ce contrat ?") && terminateMutation.mutate(r.id)}
              className="rounded p-1.5 text-ink-muted hover:bg-red-50 hover:text-danger"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contrats de bail"
        subtitle="Gestion des contrats de location"
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
    </div>
  );
}
