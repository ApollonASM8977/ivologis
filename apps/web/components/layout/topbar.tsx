"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { USER_ROLE_LABELS } from "@ivologis/shared";
import { MobileSidebar } from "./mobile-sidebar";
import { NavItem } from "./nav-config";

export function Topbar({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => (await api.get("/notifications/me?limit=1")).data,
    refetchInterval: 30_000,
  });

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-ink" />
          </button>
          <span className="text-base font-bold text-primary-dark lg:hidden">IVOLOGIS</span>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="relative rounded-full p-2 hover:bg-gray-50"
          >
            <motion.span
              animate={data?.unreadCount ? { rotate: [0, -12, 10, -8, 0] } : {}}
              transition={{ duration: 0.6, repeat: data?.unreadCount ? Infinity : 0, repeatDelay: 3.5 }}
              className="block"
            >
              <Bell className="h-5 w-5 text-ink-muted" />
            </motion.span>
            <AnimatePresence>
              {!!data?.unreadCount && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white"
                >
                  {data.unreadCount > 9 ? "9+" : data.unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user?.fullName}</p>
              <p className="text-xs text-ink-muted">{user ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS] : ""}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.fullName?.charAt(0) ?? "?"}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={logout}
            className="rounded-full p-2 text-ink-muted hover:bg-gray-50"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </motion.button>
        </div>
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} items={navItems} />
    </>
  );
}
