"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Laptop, Smartphone, Globe } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SessionRow {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

function describe(userAgent: string | null) {
  if (!userAgent) return { label: "Appareil inconnu", icon: Globe };
  if (/iphone|android|mobile/i.test(userAgent)) return { label: "Téléphone", icon: Smartphone };
  return { label: "Ordinateur", icon: Laptop };
}

function ago(dateStr: string) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { dateStyle: "medium" });
}

export function SessionsList() {
  const queryClient = useQueryClient();
  const { data: sessions } = useQuery<SessionRow[]>({
    queryKey: ["auth", "sessions"],
    queryFn: async () => (await api.get("/auth/sessions")).data,
  });

  const revoke = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/sessions/${id}`),
    onSuccess: () => {
      toast.success("Session fermée.");
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div className="space-y-3">
      <p className="font-medium text-ink">Appareils connectés</p>
      <AnimatePresence initial={false}>
        {(sessions ?? []).map((s, i) => {
          const { label, icon: Icon } = describe(s.userAgent);
          return (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {label}
                    {s.current && <Badge color="green">Cet appareil</Badge>}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Actif {ago(s.lastSeenAt)}{s.ip ? ` · ${s.ip}` : ""}
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" loading={revoke.isPending && revoke.variables === s.id} onClick={() => revoke.mutate(s.id)}>
                  Fermer
                </Button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {sessions && sessions.length === 0 && <p className="text-sm text-ink-muted">Aucune session active.</p>}
    </div>
  );
}
