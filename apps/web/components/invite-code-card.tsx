"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Copy, MessageCircle, RotateCcw } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formatDay = (date: string) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
const formatTime = (date: string) => new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function ShareActions({ message }: { message: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => navigator.clipboard.writeText(message).then(() => toast.success("Message copié"))}>
        <Copy className="h-4 w-4" /> Copier le message
      </Button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:border-primary/40 hover:text-primary"
      >
        <MessageCircle className="h-4 w-4" /> Envoyer par WhatsApp
      </a>
    </div>
  );
}

/** Accès en ligne d'un locataire/propriétaire : code d'invitation (sans compte) ou lien de réinitialisation (avec compte). */
export function InviteCodeCard({
  resource,
  id,
  userId,
  pendingUntil,
}: {
  resource: "tenants" | "owners";
  id: string;
  userId?: string | null;
  pendingUntil?: string | null;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const [invite, setInvite] = useState<{ code: string; expiresAt: string } | null>(null);
  const [resetLink, setResetLink] = useState<{ url: string; expiresAt: string } | null>(null);

  const inviteMutation = useMutation({
    mutationFn: async () => (await api.post<{ code: string; expiresAt: string }>(`/${resource}/${id}/invite`)).data,
    onSuccess: setInvite,
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
  const resetMutation = useMutation({
    mutationFn: async () => (await api.post<{ path: string; expiresAt: string }>(`/auth/reset-link/${userId}`)).data,
    onSuccess: (data) => setResetLink({ url: `${window.location.origin}${data.path}`, expiresAt: data.expiresAt }),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (role !== "SUPER_ADMIN" && role !== "ADMIN_AGENT") return null;

  if (userId) {
    return (
      <Card className="mb-4">
        <CardHeader title="Accès à l'espace en ligne" />
        <p className="text-sm text-ink-muted">Cette personne a déjà son compte.</p>
        {role === "SUPER_ADMIN" &&
          (resetLink ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-ink-muted">
                Lien de réinitialisation valable jusqu&apos;à {formatTime(resetLink.expiresAt)}, utilisable une seule fois. Transmettez-le uniquement après avoir vérifié
                l&apos;identité de la personne.
              </p>
              <ShareActions message={`Bonjour, voici votre lien pour choisir un nouveau mot de passe IVOLOGIS (valable 1 heure) : ${resetLink.url}`} />
            </div>
          ) : (
            <Button variant="secondary" className="mt-3" onClick={() => resetMutation.mutate()} loading={resetMutation.isPending}>
              <RotateCcw className="h-4 w-4" /> Générer un lien de réinitialisation du mot de passe
            </Button>
          ))}
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader title="Accès à l'espace en ligne" />
      {invite ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Transmettez ce code à la personne. Il n&apos;est affiché qu&apos;une fois, sert une seule fois et expire le {formatDay(invite.expiresAt)}.
          </p>
          <p className="w-fit rounded-lg bg-surface px-4 py-2 font-mono text-xl font-bold tracking-[0.3em] text-ink">{invite.code}</p>
          <ShareActions
            message={`Bonjour, voici votre code pour créer votre espace IVOLOGIS : ${invite.code} (valable jusqu'au ${formatDay(invite.expiresAt)}). Inscription : ${window.location.origin}/register`}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Pas encore de compte. Générez un code d&apos;invitation : c&apos;est le seul moyen de rattacher un compte à ce dossier.
            {pendingUntil && new Date(pendingUntil) > new Date() && ` Un code est déjà en cours (jusqu'au ${formatDay(pendingUntil)}) ; en générer un nouveau l'annule.`}
          </p>
          <Button onClick={() => inviteMutation.mutate()} loading={inviteMutation.isPending}>
            <KeyRound className="h-4 w-4" /> Générer un code d&apos;invitation
          </Button>
        </div>
      )}
    </Card>
  );
}
