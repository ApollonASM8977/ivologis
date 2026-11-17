"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Copy, MessageCircle } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Invite {
  code: string;
  expiresAt: string;
}

export function InviteCodeCard({
  resource,
  id,
  hasAccount,
  pendingUntil,
}: {
  resource: "tenants" | "owners";
  id: string;
  hasAccount: boolean;
  pendingUntil?: string | null;
}) {
  const role = useAuthStore((s) => s.user?.role);
  const [invite, setInvite] = useState<Invite | null>(null);
  const mutation = useMutation({
    mutationFn: async () => (await api.post<Invite>(`/${resource}/${id}/invite`)).data,
    onSuccess: setInvite,
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (role !== "SUPER_ADMIN" && role !== "ADMIN_AGENT") return null;

  const expiry = (date: string) => new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
  const message = invite
    ? `Bonjour, voici votre code pour créer votre espace IVOLOGIS : ${invite.code} (valable jusqu'au ${expiry(invite.expiresAt)}). Inscription : ${window.location.origin}/register`
    : "";

  return (
    <Card className="mb-4">
      <CardHeader title="Accès à l'espace en ligne" />
      {hasAccount ? (
        <p className="text-sm text-ink-muted">Cette personne a déjà créé son compte.</p>
      ) : invite ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Transmettez ce code à la personne. Il n&apos;est affiché qu&apos;une fois, sert une seule fois et expire le {expiry(invite.expiresAt)}.
          </p>
          <p className="w-fit rounded-lg bg-surface px-4 py-2 font-mono text-xl font-bold tracking-[0.3em] text-ink">{invite.code}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(message).then(() => toast.success("Message copié"))}
            >
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
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">
            Pas encore de compte. Générez un code d&apos;invitation : c&apos;est le seul moyen de rattacher un compte à ce dossier.
            {pendingUntil && new Date(pendingUntil) > new Date() && ` Un code est déjà en cours (jusqu'au ${expiry(pendingUntil)}) ; en générer un nouveau l'annule.`}
          </p>
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            <KeyRound className="h-4 w-4" /> Générer un code d&apos;invitation
          </Button>
        </div>
      )}
    </Card>
  );
}
