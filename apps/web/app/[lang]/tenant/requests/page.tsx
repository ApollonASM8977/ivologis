"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Paperclip, Send, FileX, MessageSquare } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { DocumentLink } from "@/components/document-link";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState } from "@/components/ui/empty-state";

interface RequestForm {
  type: "RESILIATION" | "AUTRE";
  effectiveDate: string;
  message: string;
}

const STATUS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: "amber" },
  ACCEPTEE: { label: "Acceptée", color: "green" },
  REFUSEE: { label: "Refusée", color: "red" },
};

export default function TenantRequestsPage() {
  const queryClient = useQueryClient();
  const [attachment, setAttachment] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const form = useForm<RequestForm>({ defaultValues: { type: "RESILIATION", effectiveDate: "", message: "" } });
  const type = form.watch("type");

  const { data: requests, isLoading } = useQuery<any[]>({
    queryKey: ["tenant-requests", "mine"],
    queryFn: async () => (await api.get("/tenant-requests")).data,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return (await api.post("/tenant-requests/attachment", body)).data as { url: string };
    },
    onSuccess: (res, file) => {
      setAttachment(res.url);
      setFileName(file.name);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const send = useMutation({
    mutationFn: (values: RequestForm) =>
      api.post("/tenant-requests", {
        type: values.type,
        effectiveDate: values.type === "RESILIATION" && values.effectiveDate ? new Date(values.effectiveDate).toISOString() : undefined,
        message: values.message,
        attachmentUrl: attachment ?? undefined,
      }),
    onSuccess: () => {
      toast.success("Votre demande a été envoyée à votre agence.");
      form.reset({ type: "RESILIATION", effectiveDate: "", message: "" });
      setAttachment(null);
      setFileName(null);
      queryClient.invalidateQueries({ queryKey: ["tenant-requests"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader title="Résiliation et demandes" subtitle="Envoyez une demande à votre agence et suivez son traitement" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Nouvelle demande" />
          <form onSubmit={form.handleSubmit((v) => send.mutate(v))} className="space-y-4">
            <div>
              <Label htmlFor="rq-type">Type de demande</Label>
              <Select id="rq-type" {...form.register("type")}>
                <option value="RESILIATION">Résiliation du bail</option>
                <option value="AUTRE">Autre demande</option>
              </Select>
            </div>
            <AnimatePresence initial={false}>
              {type === "RESILIATION" && (
                <motion.div key="eff" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <Label htmlFor="rq-date">Date souhaitée de départ</Label>
                  <Input id="rq-date" type="date" {...form.register("effectiveDate", { required: type === "RESILIATION" })} />
                  <p className="mt-1 text-xs text-ink-muted">Le préavis prévu au bail s&apos;applique. Votre agence vous confirmera la date.</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <Label htmlFor="rq-message">Message</Label>
              <Textarea id="rq-message" rows={4} placeholder="Expliquez votre demande (10 caractères minimum)" {...form.register("message", { required: true, minLength: 10 })} />
            </div>
            <div>
              <Label>Pièce jointe (optionnel)</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-ink-muted hover:border-primary hover:text-primary">
                <Paperclip className="h-4 w-4" />
                {upload.isPending ? "Envoi…" : fileName ?? "PDF, JPG, PNG ou WebP (5 Mo max)"}
                <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate(f); e.target.value = ""; }} />
              </label>
            </div>
            <Button type="submit" className="w-full" loading={send.isPending}>
              <Send className="h-4 w-4" /> Envoyer la demande
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Mes demandes" subtitle={requests?.length ? `${requests.length} demande(s)` : undefined} />
          {isLoading ? (
            <LoadingState />
          ) : !requests?.length ? (
            <EmptyState icon={FileX} title="Aucune demande" description="Vos demandes de résiliation et autres démarches apparaîtront ici." />
          ) : (
            <ul className="space-y-3">
              {requests.map((r, i) => (
                <motion.li key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-ink">{r.type === "RESILIATION" ? "Résiliation du bail" : "Autre demande"}</p>
                    <Badge color={STATUS[r.status]?.color ?? "gray"}>{STATUS[r.status]?.label ?? r.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    Envoyée le {new Date(r.createdAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                    {r.effectiveDate ? ` · départ souhaité le ${new Date(r.effectiveDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })}` : ""}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-ink">{r.message}</p>
                  {r.attachmentUrl && (
                    <DocumentLink path={r.attachmentUrl} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                      <Paperclip className="h-3.5 w-3.5" /> Pièce jointe
                    </DocumentLink>
                  )}
                  {r.adminResponse && (
                    <div className="mt-3 flex gap-2 rounded-lg bg-surface p-3 text-sm text-ink">
                      <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                      <p>{r.adminResponse}</p>
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
