"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OWNER_NAV } from "@/components/layout/nav-config";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={OWNER_NAV}>{children}</DashboardShell>;
}
