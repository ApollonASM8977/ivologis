"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BellRing,
  Wallet,
  Wrench,
  FileText,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { api } from "@/lib/api";
import { useOnClickOutside } from "@/lib/use-on-click-outside";

const ICONS: Record<string, typeof Bell> = {
  PAYMENT_RECEIVED: Wallet,
  PAYMENT_REMINDER: Wallet,
  MAINTENANCE_RESOLVED: Wrench,
  MAINTENANCE_NEW: Wrench,
  LEASE_EXPIRING: FileText,
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export function NotificationPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => setOpen(false));

  const { data } = useQuery({
    queryKey: ["notifications", "me"],
    queryFn: async () => (await api.get("/notifications/me?limit=15")).data,
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch(`/notifications/read-all`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.data ?? [];

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 hover:bg-gray-50"
      >
        <motion.span
          animate={unreadCount ? { rotate: [0, -12, 10, -8, 0] } : {}}
          transition={{ duration: 0.6, repeat: unreadCount ? Infinity : 0, repeatDelay: 3.5 }}
          className="block"
        >
          <Bell className="h-5 w-5 text-ink-muted" />
        </motion.span>
        <AnimatePresence>
          {!!unreadCount && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-ink">Notifications</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <Inbox className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-ink-muted">Aucune notification pour le moment.</p>
                </div>
              ) : (
                notifications.map((n: any, i: number) => {
                  const Icon = ICONS[n.type] ?? Bell;
                  return (
                    <motion.button
                      key={n.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.2) }}
                      onClick={() => !n.read && markReadMutation.mutate(n.id)}
                      className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 ${
                        n.read ? "" : "bg-primary/5"
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.read ? "bg-gray-100 text-ink-muted" : "bg-primary/15 text-primary"}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-ink">{n.title}</span>
                          {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted line-clamp-2">{n.message}</span>
                        <span className="mt-1 block text-[11px] text-ink-muted/70">{timeAgo(n.createdAt)}</span>
                      </span>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
