"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { t } from "@/lib/t-spaces";
import { locale } from "@/lib/t";

interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  authorId?: string;
  author?: { fullName: string; role?: string; avatarUrl?: string | null };
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Agence",
  ADMIN_AGENT: "Agence",
  OWNER: "Propriétaire",
  TENANT: "Locataire",
};

export function timeLabel(dateStr: string) {
  return new Date(dateStr).toLocaleString(locale(), { dateStyle: "medium", timeStyle: "short" });
}

/** Photos jointes au signalement, cliquables pour les voir en grand. */
export function MaintenancePhotos({ photos }: { photos?: string[] }) {
  if (!photos?.length) return null;
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {photos.map((url, i) => (
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
          aria-label={t("Voir la photo {0} en grand", i + 1)}
        >
          <Image src={fileUrl(url) ?? ""} alt={t("Photo {0} du problème", i + 1)} fill sizes="33vw" className="object-cover" />
        </motion.a>
      ))}
    </div>
  );
}

/** Fil d'échanges d'une demande de maintenance, partagé par l'agence, le propriétaire et le locataire. */
export function MaintenanceThread({ requestId, comments, className }: { requestId: string; comments?: Comment[]; className?: string }) {
  const queryClient = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const { register, handleSubmit, reset } = useForm<{ comment: string }>();
  const list = comments ?? [];

  const send = useMutation({
    mutationFn: (comment: string) => api.post(`/maintenance/${requestId}/comments`, { comment }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["maintenance", requestId] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Card className={className}>
      <CardHeader title={t("Échanges")} subtitle={list.length ? `${list.length} message(s)` : undefined} />
      <div className="mb-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {list.length === 0 && (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-6 text-center text-sm text-ink-muted">
              {t("Aucun message pour l'instant. Posez vos questions ici.")}
            </motion.p>
          )}
          {list.map((c) => {
            const mine = !!me && c.authorId === me.id;
            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}
              >
                <Avatar src={c.author?.avatarUrl} name={c.author?.fullName} size="sm" />
                <div className={`flex-1 rounded-xl px-3.5 py-2.5 ${mine ? "bg-primary/10" : "bg-gray-50"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {mine ? t("Vous") : c.author?.fullName ?? t("Utilisateur")}
                      {!mine && c.author?.role && <span className="ml-1.5 text-xs font-normal text-ink-muted">· {ROLE_LABEL[c.author.role] ?? ""}</span>}
                    </p>
                    <p className="text-[11px] text-ink-muted">{timeLabel(c.createdAt)}</p>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink-muted">{c.comment}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <form onSubmit={handleSubmit((v) => v.comment?.trim() && send.mutate(v.comment.trim()))} className="flex gap-2">
        <Input aria-label={t("Votre message")} placeholder={t("Écrire un message…")} maxLength={2000} {...register("comment")} />
        <Button type="submit" size="sm" loading={send.isPending} aria-label={t("Envoyer le message")}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
