"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { TENANT_NAV } from "@/components/layout/nav-config";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={TENANT_NAV}>{children}</DashboardShell>;
}
