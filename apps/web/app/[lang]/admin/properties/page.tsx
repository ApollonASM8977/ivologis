"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Building2, MapPin } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { PROPERTY_TYPE_LABELS, PropertyStatus } from "@ivologis/shared";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PropertyStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { PropertyForm, PropertyFormValues } from "@/components/properties/property-form";
import { t } from "@/lib/t-spaces";
import { money } from "@/lib/t";

interface PropertyRow {
  id: string;
  name: string;
  type: string;
  commune: string;
  status: PropertyStatus;
  rentAmount: number;
  owner: { fullName: string };
  currentTenant?: { fullName: string } | null;
  reviewRequestedAt?: string | null;
  shortStayEnabled?: boolean;
  shortStayApproved?: boolean;
  forSale?: boolean;
  landTitleVerified?: boolean;
  saleStatus?: string;
}

/** Pourquoi le bien attend l'agence (même règle que `TO_REVIEW_WHERE` côté API). */
function reviewReasons(row: PropertyRow) {
  return [
    row.reviewRequestedAt && t("Modifié par le propriétaire"),
    row.shortStayEnabled && !row.shortStayApproved && t("Courte durée à valider"),
    row.forSale && !row.landTitleVerified && row.saleStatus !== "VENDU" && t("Titre foncier à vérifier"),
  ].filter(Boolean) as string[];
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
  const [toReview, setToReview] = useState(searchParams.get("toReview") === "1");
  const [modalOpen, setModalOpen] = useState(searchParams.get("new") === "1");

  const { data, isLoading } = useQuery({
    queryKey: ["properties", page, status, toReview],
    queryFn: async () =>
      (await api.get("/properties", { params: { page, limit: 10, status: status || undefined, toReview: toReview || undefined } })).data,
  });
  const { data: reviewCount } = useQuery({
    queryKey: ["properties", "to-review-count"],
    queryFn: async () => (await api.get("/properties", { params: { limit: 1, toReview: true } })).data.total as number,
  });

  const createMutation = useMutation({
    mutationFn: (values: PropertyFormValues) => api.post("/properties", values),
    onSuccess: () => {
      toast.success(t("Bien ajouté avec succès."));
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
          {reviewReasons(row).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {reviewReasons(row).map((reason) => <Badge key={reason} color="amber">{reason}</Badge>)}
            </div>
          )}
        </div>
      ),
    },
    { header: "Type", cell: (row) => PROPERTY_TYPE_LABELS[row.type as keyof typeof PROPERTY_TYPE_LABELS] },
    { header: t("Propriétaire"), cell: (row) => row.owner?.fullName },
    { header: "Locataire", cell: (row) => row.currentTenant?.fullName ?? "-" },
    { header: "Loyer", cell: (row) => money(row.rentAmount) },
    { header: "Statut", cell: (row) => <PropertyStatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title={t("Gestion des biens")}
        subtitle={t("Villas, appartements, studios, terrains et plus")}
        action={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />{" "}{t("Ajouter un bien")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select className="w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{t("Tous les statuts")}</option>
          <option value="VACANT">{t("Vacant")}</option>
          <option value="LOUE">{t("Loué")}</option>
          <option value="MAINTENANCE">{t("En maintenance")}</option>
          <option value="SUSPENDU">{t("Suspendu")}</option>
        </Select>
        <Button
          size="sm"
          variant={toReview ? "primary" : "secondary"}
          aria-pressed={toReview}
          onClick={() => {
            setToReview(!toReview);
            setPage(1);
          }}
        >
          {reviewCount === undefined ? t("À vérifier") : t("À vérifier ({0})", reviewCount)}
        </Button>
      </div>

      {!isLoading && data?.data?.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("Aucun bien enregistré")}
          description={t("Commencez par ajouter votre premier bien immobilier.")}
          action={<Button onClick={() => setModalOpen(true)}>{t("Ajouter un bien")}</Button>}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("Ajouter un bien")} width="max-w-2xl">
        <PropertyForm
          showOwnerField
          loading={createMutation.isPending}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      </Modal>
    </div>
  );
}
