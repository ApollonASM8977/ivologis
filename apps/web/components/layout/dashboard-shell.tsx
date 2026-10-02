import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { NavItem } from "./nav-config";

export function DashboardShell({
  navItems,
  children,
}: {
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar items={navItems} />
      <div className="lg:pl-64">
        <Topbar navItems={navItems} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
