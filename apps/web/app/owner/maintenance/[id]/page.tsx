"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Send, Wrench, MapPin, Banknote, Clock } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF, MAINTENANCE_ISSUE_LABELS, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  author?: { fullName: string; avatarUrl?: string | null };
}

function timeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function OwnerMaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => (await api.get(`/maintenance/${id}`)).data,
  });

  const { register, handleSubmit, reset } = useForm<{ comment: string }>();

  const commentMutation = useMutation({
    mutationFn: (comment: string) => api.post(`/maintenance/${id}/comments`, { comment }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["maintenance", id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !request) return <LoadingState />;

  const comments: Comment[] = request.comments ?? [];

  return (
    <div>
      <button onClick={() => router.push("/owner/maintenance")} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour aux demandes
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="mb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-semibold text-ink">
                <Wrench className="h-5 w-5 text-primary" />
                {MAINTENANCE_ISSUE_LABELS[request.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS]}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
                <MapPin className="h-3.5 w-3.5" /> {request.property?.name} · Signalé par {request.tenant?.fullName} · Priorité{" "}
                {MAINTENANCE_PRIORITY_LABELS[request.priority as keyof typeof MAINTENANCE_PRIORITY_LABELS]}
              </p>
            </div>
            <MaintenanceStatusBadge status={request.status} />
          </div>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink">{request.description}</p>
          {!!request.photos?.length && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {request.photos.map((url: string, i: number) => (
                <motion.a
                  key={url}
                  href={fileUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative block h-28 overflow-hidden rounded-lg"
                >
                  <Image src={fileUrl(url) ?? ""} alt="Photo du problème" fill sizes="33vw" className="object-cover" />
                </motion.a>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Échanges" />
          <div className="mb-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {comments.length === 0 && (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center text-sm text-ink-muted">
                  Aucun message pour l&apos;instant. Posez vos questions ici.
                </motion.p>
              )}
              {comments.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <Avatar src={c.author?.avatarUrl} name={c.author?.fullName} size="sm" />
                  <div className="flex-1 rounded-xl bg-gray-50 px-3.5 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{c.author?.fullName ?? "Utilisateur"}</p>
                      <p className="text-[11px] text-ink-muted">{timeLabel(c.createdAt)}</p>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">{c.comment}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <form onSubmit={handleSubmit((v) => v.comment?.trim() && commentMutation.mutate(v.comment.trim()))} className="flex gap-2">
            <Input placeholder="Écrire un message…" {...register("comment")} />
            <Button type="submit" size="sm" loading={commentMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <StaggerContainer className="space-y-4">
          <StaggerItem>
            <Card>
              <CardHeader title="Coûts" />
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-muted">
                    <Banknote className="h-4 w-4" /> Coût estimé
                  </span>
                  <span className="font-medium text-ink">{request.estimatedCost ? formatXOF(request.estimatedCost) : "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink-muted">
                    <Banknote className="h-4 w-4" /> Coût final
                  </span>
                  <span className="font-medium text-ink">{request.finalCost ? formatXOF(request.finalCost) : "-"}</span>
                </div>
              </div>
            </Card>
          </StaggerItem>
          <StaggerItem>
            <Card>
              <CardHeader title="Suivi" />
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-ink-muted" />
                  <div>
                    <p className="font-medium text-ink">Demande reçue</p>
                    <p className="text-xs text-ink-muted">{timeLabel(request.createdAt)}</p>
                  </div>
                </li>
                {request.adminComment && (
                  <li className="rounded-lg bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">Note de l&apos;agence</p>
                    <p className="mt-1 text-ink">{request.adminComment}</p>
                  </li>
                )}
              </ol>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
}
