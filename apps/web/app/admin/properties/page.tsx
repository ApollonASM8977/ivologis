"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Building2, MapPin } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatXOF, PROPERTY_TYPE_LABELS, PropertyStatus } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyStatusBadge } from "@/components/status-badges";
import { PropertyForm, PropertyFormValues } from "@/components/properties/property-form";

interface PropertyRow {
  id: string;
  name: string;
  type: string;
  commune: string;
  status: PropertyStatus;
  rentAmount: number;
  owner: { fullName: string };
  currentTenant?: { fullName: string } | null;
}

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={null}>
      <AdminPropertiesPageContent />
    </Suspense>
  );
}

function AdminPropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");

  const { data, isLoading } = useQuery({
    queryKey: ["properties", page, status],
    queryFn: async () =>
      (await api.get("/properties", { params: { page, limit: 10, status: status || undefined } })).data,
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

  const columns: Column<PropertyRow>[] = [
    {
      header: "Bien",
      cell: (row) => (
        <div>
          <p className="font-medium text-ink">{row.name}</p>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" /> {row.commune}
          </p>
        </div>
      ),
    },
    { header: "Type", cell: (row) => PROPERTY_TYPE_LABELS[row.type as keyof typeof PROPERTY_TYPE_LABELS] },
    { header: "Propriétaire", cell: (row) => row.owner?.fullName },
    { header: "Locataire", cell: (row) => row.currentTenant?.fullName ?? "—" },
    { header: "Loyer", cell: (row) => formatXOF(row.rentAmount) },
    { header: "Statut", cell: (row) => <PropertyStatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Gestion des biens"
        subtitle="Villas, appartements, studios, terrains et plus"
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un bien
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="VACANT">Vacant</option>
          <option value="LOUE">Loué</option>
          <option value="MAINTENANCE">En maintenance</option>
          <option value="SUSPENDU">Suspendu</option>
        </Select>
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun bien enregistré"
          description="Commencez par ajouter votre premier bien immobilier."
          action={<Button onClick={() => setModalOpen(true)}>Ajouter un bien</Button>}
        />
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
          onRowClick={(row) => router.push(`/admin/properties/${row.id}`)}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un bien" width="max-w-2xl">
        <PropertyForm
          showOwnerField
          loading={createMutation.isPending}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      </Modal>
    </div>
  );
}
