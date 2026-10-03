"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, UserRound } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { LeaseStatusBadge } from "@/components/status-badges";
import { TenantForm, TenantFormValues } from "@/components/tenants/tenant-form";
import { SearchInput, useDebouncedValue } from "@/components/ui/search-input";

interface TenantRow {
  id: string;
  fullName: string;
  phone: string;
  currentProperties: { id: string; name: string }[];
  leases: { status: any }[];
}

export default function AdminTenantsPage() {
  return (
    <Suspense fallback={null}>
      <AdminTenantsPageContent />
    </Suspense>
  );
}

function AdminTenantsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", page, debouncedSearch],
    queryFn: async () => (await api.get("/tenants", { params: { page, limit: 10, search: debouncedSearch || undefined } })).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: TenantFormValues) => api.post("/tenants", values),
    onSuccess: () => {
      toast.success("Locataire ajouté.");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<TenantRow>[] = [
    { header: "Nom", cell: (r) => <span className="font-medium text-ink">{r.fullName}</span> },
    { header: "Téléphone", cell: (r) => r.phone },
    { header: "Logement actuel", cell: (r) => r.currentProperties?.[0]?.name ?? "Aucun" },
    {
      header: "Contrat",
      cell: (r) => (r.leases?.[0] ? <LeaseStatusBadge status={r.leases[0].status} /> : "—"),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Locataires"
        subtitle="Tous les locataires gérés par IVOLOGIS"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un locataire
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Rechercher par nom ou téléphone…"
        />
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={UserRound} title={debouncedSearch ? "Aucun résultat" : "Aucun locataire"} description={debouncedSearch ? `Aucun locataire ne correspond à « ${debouncedSearch} ».` : undefined} action={<Button onClick={() => setModalOpen(true)}>Ajouter un locataire</Button>} />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          loading={isLoading}
          rowKey={(r) => r.id}
          page={page}
          limit={10}
          total={data?.total}
          onPageChange={setPage}
          onRowClick={(row) => router.push(`/admin/tenants/${row.id}`)}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un locataire" width="max-w-2xl">
        <TenantForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>
    </div>
  );
}
