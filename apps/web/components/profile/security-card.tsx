"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, Copy, LogOut } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SessionsList } from "@/components/profile/sessions-list";

interface SetupResponse {
  secret: string;
  otpauthUrl: string;
}

export function SecurityCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [setup, setSetup] = useState<SetupResponse | null>(null);
  const { register, handleSubmit, reset } = useForm<{ code: string }>();

  const { data: me } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => (await api.get("/auth/me")).data,
  });

  const setupMutation = useMutation({
    mutationFn: async () => (await api.post("/auth/2fa/setup")).data as SetupResponse,
    onSuccess: (data) => setSetup(data),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const enableMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/enable", { code }),
    onSuccess: () => {
      toast.success("Double authentification activée.");
      setSetup(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const disableMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/disable", { code }),
    onSuccess: () => {
      toast.success("Double authentification désactivée.");
      reset();
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const logoutAllMutation = useMutation({
    mutationFn: () => api.post("/auth/logout-all"),
    onSuccess: () => {
      clearSession();
      router.push("/login");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const enabled = !!me?.totpEnabled;

  return (
    <Card className="max-w-xl">
      <CardHeader title="Sécurité du compte" />

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            {enabled ? (
              <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
            ) : (
              <ShieldAlert className="mt-0.5 h-5 w-5 text-warning" />
            )}
            <div>
              <p className="font-medium text-ink">Double authentification</p>
              <p className="text-sm text-ink-muted">Un code à 6 chiffres, généré par votre application d&apos;authentification, est demandé à chaque connexion.</p>
            </div>
          </div>
          <Badge color={enabled ? "green" : "amber"}>{enabled ? "Activée" : "Désactivée"}</Badge>
        </div>

        {!enabled && !setup && (
          <Button variant="secondary" loading={setupMutation.isPending} onClick={() => setupMutation.mutate()}>
            Configurer la double authentification
          </Button>
        )}

        <AnimatePresence>
          {!enabled && setup && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden rounded-xl border border-gray-100 bg-surface p-4"
            >
              <p className="text-sm text-ink">
                Dans Google Authenticator, Microsoft Authenticator ou Authy, ajoutez un compte avec cette clé :
              </p>
              <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-mono text-sm tracking-widest text-ink ring-1 ring-gray-200">
                <span className="flex-1 break-all">{setup.secret}</span>
                <button
                  type="button"
                  aria-label="Copier la clé"
                  onClick={() => navigator.clipboard?.writeText(setup.secret).then(() => toast.success("Clé copiée."))}
                  className="rounded p-1 text-ink-muted hover:bg-gray-100 hover:text-primary"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <a href={setup.otpauthUrl} className="inline-block text-sm font-medium text-primary hover:underline">
                Ouvrir directement dans mon application
              </a>
              <form onSubmit={handleSubmit((v) => enableMutation.mutate(v.code.trim()))} className="space-y-3">
                <div>
                  <Label htmlFor="2fa-enable">Code affiché dans l&apos;application</Label>
                  <Input
                    id="2fa-enable"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    {...register("code", { required: true, pattern: /^\d{6}$/ })}
                  />
                </div>
                <Button type="submit" loading={enableMutation.isPending}>
                  Activer
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {enabled && (
          <form onSubmit={handleSubmit((v) => disableMutation.mutate(v.code.trim()))} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[10rem] flex-1">
              <Label htmlFor="2fa-disable">Code pour désactiver</Label>
              <Input
                id="2fa-disable"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                {...register("code", { required: true, pattern: /^\d{6}$/ })}
              />
            </div>
            <Button type="submit" variant="danger" loading={disableMutation.isPending}>
              Désactiver
            </Button>
          </form>
        )}

        <SessionsList />
        <div className="border-t border-gray-100 pt-5">
          <p className="font-medium text-ink">Sessions</p>
          <p className="mb-3 text-sm text-ink-muted">Ferme la session sur tous vos appareils, y compris celui-ci.</p>
          <Button variant="ghost" loading={logoutAllMutation.isPending} onClick={() => logoutAllMutation.mutate()}>
            <LogOut className="h-4 w-4" /> Déconnecter partout
          </Button>
        </div>
      </div>
    </Card>
  );
}
