import {
  LayoutDashboard,
  Building2,
  Users,
  UserRound,
  FileText,
  Wallet,
  Wrench,
  BarChart3,
  Settings,
  Home,
  Receipt,
  ClipboardList,
  UserCircle,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Biens", href: "/admin/properties", icon: Building2 },
  { label: "Propriétaires", href: "/admin/owners", icon: Users },
  { label: "Locataires", href: "/admin/tenants", icon: UserRound },
  { label: "Contrats", href: "/admin/leases", icon: FileText },
  { label: "Paiements", href: "/admin/payments", icon: Wallet },
  { label: "Maintenance", href: "/admin/maintenance", icon: Wrench },
  { label: "Statistiques", href: "/admin/reports", icon: BarChart3 },
  { label: "Paramètres", href: "/admin/settings", icon: Settings },
];

export const OWNER_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Mes biens", href: "/owner/properties", icon: Building2 },
  { label: "Mes locataires", href: "/owner/tenants", icon: UserRound },
  { label: "Paiements", href: "/owner/payments", icon: Wallet },
  { label: "Contrats", href: "/owner/leases", icon: FileText },
  { label: "Relevé financier", href: "/owner/reports", icon: BarChart3 },
  { label: "Maintenance", href: "/owner/maintenance", icon: Wrench },
  { label: "Profil", href: "/owner/profile", icon: UserCircle },
];

export const TENANT_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/tenant/dashboard", icon: LayoutDashboard },
  { label: "Mon logement", href: "/tenant/property", icon: Home },
  { label: "Mon contrat", href: "/tenant/lease", icon: FileText },
  { label: "Paiements", href: "/tenant/payments", icon: Receipt },
  { label: "Maintenance", href: "/tenant/maintenance", icon: ClipboardList },
  { label: "Profil", href: "/tenant/profile", icon: UserCircle },
];
