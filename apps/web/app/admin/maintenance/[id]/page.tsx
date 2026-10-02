"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF, MAINTENANCE_ISSUE_LABELS, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";
import { MaintenanceStatusBadge } from "@/components/status-badges";

interface UpdateForm {
  status: string;
  technicianId?: string;
  estimatedCost?: number;
  finalCost?: number;
  adminComment?: string;
}

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => (await api.get(`/maintenance/${id}`)).data,
  });

  const { data: technicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => (await api.get("/technicians")).data,
  });

  const { register, handleSubmit } = useForm<UpdateForm>();
  const { register: registerComment, handleSubmit: handleCommentSubmit, reset: resetComment } = useForm<{ comment: string }>();

  const updateMutation = useMutation({
    mutationFn: (values: UpdateForm) => api.patch(`/maintenance/${id}`, values),
    onSuccess: () => {
      toast.success("Demande mise à jour.");
      queryClient.invalidateQueries({ queryKey: ["maintenance", id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const commentMutation = useMutation({
    mutationFn: (comment: string) => api.post(`/maintenance/${id}/comments`, { comment }),
    onSuccess: () => {
      resetComment();
      queryClient.invalidateQueries({ queryKey: ["maintenance", id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !request) return <LoadingState />;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-ink">
                {MAINTENANCE_ISSUE_LABELS[request.issueType as keyof typeof MAINTENANCE_ISSUE_LABELS]}
              </h1>
              <MaintenanceStatusBadge status={request.status} />
            </div>
            <p className="text-sm text-ink-muted">
              {request.property?.name} · Signalé par {request.tenant?.fullName} · Priorité{" "}
              {MAINTENANCE_PRIORITY_LABELS[request.priority as keyof typeof MAINTENANCE_PRIORITY_LABELS]}
            </p>
            <p className="mt-4 text-sm text-ink">{request.description}</p>
            {!!request.photos?.length && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {request.photos.map((url: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={fileUrl(url)} alt="photo" className="h-24 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Commentaires" />
            <div className="mb-3 space-y-3">
              {request.comments?.length ? (
                request.comments.map((c: any) => (
                  <div key={c.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-ink">{c.author?.fullName}</p>
                    <p className="text-ink-muted">{c.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink-muted">Aucun commentaire.</p>
              )}
            </div>
            <form
              onSubmit={handleCommentSubmit((v) => v.comment?.trim() && commentMutation.mutate(v.comment))}
              className="flex gap-2"
            >
              <Input placeholder="Ajouter un commentaire..." {...registerComment("comment")} />
              <Button type="submit" size="sm" loading={commentMutation.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        <Card>
          <CardHeader title="Traitement" />
          <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="space-y-3">
            <div>
              <Label>Statut</Label>
              <Select defaultValue={request.status} {...register("status")}>
                <option value="RECU">Reçu</option>
                <option value="EN_COURS">En cours</option>
                <option value="RESOLU">Résolu</option>
                <option value="REJETE">Rejeté</option>
              </Select>
            </div>
            <div>
              <Label>Technicien assigné</Label>
              <Select defaultValue={request.technicianId ?? ""} {...register("technicianId")}>
                <option value="">Aucun</option>
                {technicians?.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Coût estimé (FCFA)</Label>
              <Input type="number" defaultValue={request.estimatedCost ?? ""} {...register("estimatedCost", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Coût final (FCFA)</Label>
              <Input type="number" defaultValue={request.finalCost ?? ""} {...register("finalCost", { valueAsNumber: true })} />
            </div>
            <div>
              <Label>Commentaire admin</Label>
              <Textarea rows={2} defaultValue={request.adminComment ?? ""} {...register("adminComment")} />
            </div>
            <Button type="submit" className="w-full" loading={updateMutation.isPending}>
              Mettre à jour
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
