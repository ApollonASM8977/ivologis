"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ADMIN_NAV } from "@/components/layout/nav-config";
import { useAuthStore } from "@/lib/auth-store";
import { UserRole } from "@ivologis/shared";

const SUPER_ADMIN_ONLY_HREFS = ["/admin/team", "/admin/audit-log", "/admin/settings", "/admin/contact-requests"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const navItems =
    user?.role === UserRole.SUPER_ADMIN
      ? ADMIN_NAV
      : ADMIN_NAV.filter((item) => !SUPER_ADMIN_ONLY_HREFS.includes(item.href));

  return <DashboardShell navItems={navItems}>{children}</DashboardShell>;
}
