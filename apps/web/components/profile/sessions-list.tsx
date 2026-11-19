"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Laptop, Smartphone, Globe } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/t-spaces";
import { locale } from "@/lib/t";

interface SessionRow {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

// U-14 : navigateur et système lus dans l'en-tête User-Agent (ordre important : Edge et Opera se disent aussi « Chrome »).
const BROWSERS: [RegExp, string][] = [[/edg\//i, "Edge"], [/opr\/|opera/i, "Opera"], [/samsungbrowser/i, "Samsung Internet"], [/firefox|fxios/i, "Firefox"], [/chrome|crios/i, "Chrome"], [/safari/i, "Safari"]];
const SYSTEMS: [RegExp, string][] = [[/iphone|ipad|ipod/i, "iOS"], [/android/i, "Android"], [/windows/i, "Windows"], [/mac os/i, "macOS"], [/cros/i, "ChromeOS"], [/linux/i, "Linux"]];

function describe(userAgent: string | null) {
  if (!userAgent) return { label: t("Appareil inconnu"), icon: Globe };
  const browser = BROWSERS.find(([re]) => re.test(userAgent))?.[1] ?? t("Navigateur inconnu");
  const system = SYSTEMS.find(([re]) => re.test(userAgent))?.[1];
  const phone = /iphone|android|mobile/i.test(userAgent);
  return { label: `${phone ? t("Téléphone") : t("Ordinateur")} · ${browser}${system ? ` · ${system}` : ""}`, icon: phone ? Smartphone : Laptop };
}

function ago(dateStr: string) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (minutes < 1) return t("à l'instant");
  if (minutes < 60) return t("il y a {0} min", minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return new Date(dateStr).toLocaleDateString(locale(), { dateStyle: "medium" });
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
      toast.success(t("Session fermée."));
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const revokeOthers = useMutation({
    mutationFn: () => api.delete("/auth/sessions"),
    onSuccess: () => {
      toast.success(t("Autres sessions fermées."));
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
  const others = (sessions ?? []).filter((s) => !s.current).length;

  return (
    <div className="space-y-3">
      <p className="font-medium text-ink">{t("Appareils connectés")}</p>
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
                    {s.current && <Badge color="green">{t("Cet appareil")}</Badge>}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {t("Actif")}{" "}{ago(s.lastSeenAt)}{s.ip ? ` · ${s.ip}` : ""}
                  </p>
                </div>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" loading={revoke.isPending && revoke.variables === s.id} onClick={() => revoke.mutate(s.id)}>
                  {t("Fermer")}
                </Button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {sessions && sessions.length === 0 && <p className="text-sm text-ink-muted">{t("Aucune session active.")}</p>}
      {others > 0 && (
        <Button variant="ghost" size="sm" loading={revokeOthers.isPending} onClick={() => revokeOthers.mutate()} data-revoke-others>
          {t("Fermer les autres sessions")}
        </Button>
      )}
    </div>
  );
}
