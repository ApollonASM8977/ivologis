"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, CheckCircle2, XCircle, Paperclip } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentLink } from "@/components/document-link";

interface RequestRow {
  id: string;
  type: "RESILIATION" | "AUTRE";
  status: "EN_ATTENTE" | "ACCEPTEE" | "REFUSEE";
  effectiveDate?: string | null;
  message: string;
  attachmentUrl?: string | null;
  adminResponse?: string | null;
  createdAt: string;
  tenant: { fullName: string; phone: string };
  lease: { contractNumber: string; endDate: string; property: { name: string } } | null;
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "À traiter", color: "amber" },
  ACCEPTEE: { label: "Acceptée", color: "green" },
  REFUSEE: { label: "Refusée", color: "red" },
};

export default function AdminTenantRequestsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("EN_ATTENTE");
  const [deciding, setDeciding] = useState<{ row: RequestRow; status: "ACCEPTEE" | "REFUSEE" } | null>(null);
  const form = useForm<{ adminResponse: string }>({ defaultValues: { adminResponse: "" } });

  const { data, isLoading } = useQuery<RequestRow[]>({
    queryKey: ["tenant-requests", "all", filter],
    queryFn: async () => (await api.get("/tenant-requests", { params: filter ? { status: filter } : {} })).data,
  });

  const decide = useMutation({
    mutationFn: (values: { adminResponse: string }) =>
      api.patch(`/tenant-requests/${deciding?.row.id}`, { status: deciding?.status, adminResponse: values.adminResponse || undefined }),
    onSuccess: () => {
      toast.success("Décision enregistrée. Le locataire est prévenu.");
      setDeciding(null);
      form.reset({ adminResponse: "" });
      queryClient.invalidateQueries({ queryKey: ["tenant-requests"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const columns: Column<RequestRow>[] = [
    { header: "Locataire", cell: (r) => <div><p className="font-medium text-ink">{r.tenant.fullName}</p><p className="text-xs text-ink-muted">{r.tenant.phone}</p></div> },
    { header: "Bien", cell: (r) => <span className="text-sm">{r.lease?.property.name ?? "-"}<br /><span className="text-xs text-ink-muted">{r.lease?.contractNumber}</span></span> },
    { header: "Demande", cell: (r) => <div><p className="text-sm font-medium">{r.type === "RESILIATION" ? "Résiliation" : "Autre"}</p>{r.effectiveDate && <p className="text-xs text-ink-muted">Départ souhaité le {new Date(r.effectiveDate).toLocaleDateString("fr-FR")}</p>}</div> },
    { header: "Reçue le", cell: (r) => new Date(r.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" }) },
    { header: "Statut", cell: (r) => <Badge color={STATUS_BADGE[r.status]?.color ?? "gray"}>{STATUS_BADGE[r.status]?.label ?? r.status}</Badge> },
    {
      header: "Actions",
      cell: (r) => (
        <div className="flex flex-wrap items-center gap-1">
          {r.attachmentUrl && (
            <DocumentLink path={r.attachmentUrl} title="Pièce jointe" aria-label="Ouvrir la pièce jointe" className="rounded p-1.5 text-ink-muted hover:bg-gray-100 hover:text-primary">
              <Paperclip className="h-4 w-4" />
            </DocumentLink>
          )}
          {r.status === "EN_ATTENTE" && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setDeciding({ row: r, status: "ACCEPTEE" })}>
                <CheckCircle2 className="h-4 w-4" /> Accepter
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeciding({ row: r, status: "REFUSEE" })}>
                <XCircle className="h-4 w-4" /> Refuser
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Demandes des locataires" subtitle="Résiliations et autres démarches à traiter" />

      <div className="mb-4 flex gap-3">
        <Select aria-label="Filtrer par statut" className="w-56" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="EN_ATTENTE">À traiter</option>
          <option value="ACCEPTEE">Acceptées</option>
          <option value="REFUSEE">Refusées</option>
          <option value="">Toutes</option>
        </Select>
      </div>

      {!isLoading && data?.length === 0 ? (
        <EmptyState icon={Mail} title="Aucune demande" description="Les demandes envoyées par les locataires apparaîtront ici." />
      ) : (
        <DataTable columns={columns} rows={data ?? []} loading={isLoading} rowKey={(r) => r.id} />
      )}

      <Modal open={!!deciding} onClose={() => setDeciding(null)} title={deciding?.status === "ACCEPTEE" ? "Accepter la demande" : "Refuser la demande"} width="max-w-lg">
        <form onSubmit={form.handleSubmit((v) => decide.mutate(v))} className="space-y-4">
          <p className="text-sm text-ink-muted">
            {deciding?.row.message}
          </p>
          <div>
            <Label htmlFor="resp">Réponse au locataire (optionnel)</Label>
            <Textarea id="resp" rows={3} {...form.register("adminResponse", { maxLength: 1000 })} />
          </div>
          <p className="text-xs text-ink-muted">Pour une résiliation acceptée, procédez ensuite à la résiliation du bail depuis sa fiche.</p>
          <Button type="submit" className="w-full" loading={decide.isPending}>
            Confirmer
          </Button>
        </form>
      </Modal>
    </div>
  );
}
