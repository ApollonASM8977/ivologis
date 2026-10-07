"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Inbox, CheckCircle2, Circle, Mail, Phone } from "lucide-react";
import { motion } from "motion/react";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

interface ContactRow {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  portfolioSize?: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
}

export default function AdminContactRequestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["contact-requests", page],
    queryFn: async () => (await api.get("/contact-requests", { params: { page, limit: 20 } })).data,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) => api.patch(`/contact-requests/${id}`, { handled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-requests"] }),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const rows: ContactRow[] = data?.data ?? [];
  const pending = rows.filter((r) => !r.handled).length;

  const columns: Column<ContactRow>[] = [
    {
      header: "Demande",
      cell: (r) => (
        <div>
          <p className="font-medium text-ink">{r.fullName}</p>
          <p className="text-xs text-ink-muted">{r.organization ?? "Particulier"}</p>
        </div>
      ),
    },
    {
      header: "Contact",
      cell: (r) => (
        <div className="space-y-1 text-xs text-ink-muted">
          <p className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{r.email}</p>
          {r.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{r.phone}</p>}
        </div>
      ),
    },
    { header: "Parc", cell: (r) => (r.portfolioSize ? <Badge color="blue">{r.portfolioSize} biens</Badge> : "-") },
    { header: "Reçue le", cell: (r) => new Date(r.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" }) },
    {
      header: "Statut",
      cell: (r) =>
        r.handled ? (
          <Badge color="green">Traitée</Badge>
        ) : (
          <Badge color="amber">À traiter</Badge>
        ),
    },
    {
      header: "Action",
      cell: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {expanded === r.id ? "Masquer" : "Lire"}
          </button>
          <Button
            size="sm"
            variant="ghost"
            loading={toggleMutation.isPending && toggleMutation.variables?.id === r.id}
            onClick={() => toggleMutation.mutate({ id: r.id, handled: !r.handled })}
          >
            {r.handled ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {r.handled ? "Rouvrir" : "Marquer traitée"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Demandes de démo"
        subtitle={pending ? `${pending} demande(s) à traiter sur cette page` : "Demandes reçues depuis le site vitrine"}
      />

      {!isLoading && rows.length === 0 ? (
        <EmptyState icon={Inbox} title="Aucune demande pour le moment" description="Les demandes envoyées depuis la page d'accueil apparaîtront ici." />
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            rowKey={(r) => r.id}
            page={page}
            limit={20}
            total={data?.total}
            onPageChange={setPage}
          />
          <div className="mt-4 space-y-3">
            {rows
              .filter((r) => r.id === expanded)
              .map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-gray-100 bg-white p-5 text-sm leading-relaxed text-ink shadow-sm"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Message</p>
                  <p className="whitespace-pre-line">{r.message}</p>
                </motion.div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
