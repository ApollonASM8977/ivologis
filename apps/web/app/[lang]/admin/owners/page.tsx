"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Users } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountStatusBadge } from "@/components/status-badges";
import { OwnerForm, OwnerFormValues } from "@/components/owners/owner-form";
import { SearchInput, useDebouncedValue } from "@/components/ui/search-input";

interface OwnerRow {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  status: any;
  _count: { properties: number };
}

export default function AdminOwnersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOwnersPageContent />
    </Suspense>
  );
}

function AdminOwnersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");

  const { data, isLoading } = useQuery({
    queryKey: ["owners", page, debouncedSearch],
    queryFn: async () => (await api.get("/owners", { params: { page, limit: 10, search: debouncedSearch || undefined } })).data,
  });

  const createMutation = useMutation({
    mutationFn: (values: OwnerFormValues) => api.post("/owners", values),
    onSuccess: () => {
      toast.success("Propriétaire ajouté.");
      queryClient.invalidateQueries({ queryKey: ["owners"] });
      setModalOpen(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<OwnerRow>[] = [
    { header: "Nom", cell: (r) => <span className="font-medium text-ink">{r.fullName}</span> },
    { header: "Téléphone", cell: (r) => r.phone },
    { header: "Email", cell: (r) => r.email ?? "-" },
    { header: "Biens", cell: (r) => r._count?.properties ?? 0 },
    { header: "Statut", cell: (r) => <AccountStatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Propriétaires"
        subtitle="Propriétaires externes gérés par IVOLOGIS"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un propriétaire
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
          placeholder="Rechercher par nom, téléphone ou email…"
        />
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState icon={Users} title={debouncedSearch ? "Aucun résultat" : "Aucun propriétaire"} description={debouncedSearch ? `Aucun propriétaire ne correspond à « ${debouncedSearch} ».` : undefined} action={<Button onClick={() => setModalOpen(true)}>Ajouter un propriétaire</Button>} />
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
          onRowClick={(row) => router.push(`/admin/owners/${row.id}`)}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un propriétaire">
        <OwnerForm loading={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </Modal>
    </div>
  );
}
