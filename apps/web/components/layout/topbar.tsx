"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "@/lib/auth-store";
import { USER_ROLE_LABELS } from "@ivologis/shared";
import { MobileSidebar } from "./mobile-sidebar";
import { NotificationPanel } from "./notification-panel";
import { NavItem } from "./nav-config";
import { Avatar } from "@/components/ui/avatar";

export function Topbar({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter();
  const { user, clearSession } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5 text-ink" />
          </button>
          <span className="text-base font-bold text-primary-dark lg:hidden">IVOLOGIS</span>
        </div>

        <div className="flex items-center gap-4">
          <NotificationPanel />

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user?.fullName}</p>
              <p className="text-xs text-ink-muted">{user ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS] : ""}</p>
            </div>
            <Avatar src={user?.avatarUrl} name={user?.fullName} size="md" />
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
