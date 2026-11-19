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
  UserCog,
  HardHat,
  History,
  Inbox,
  Mail,
  CalendarRange,
  Tag,
  LayoutGrid,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Titre de rubrique affiché au-dessus du premier élément du groupe (U-11). */
  group?: string;
  /** Autres pages qui allument cet élément (onglets d'une même rubrique). */
  also?: string[];
}

export function isNavActive(item: NavItem, pathname: string) {
  return [item.href, ...(item.also ?? [])].some((href) => pathname === href || pathname.startsWith(href + "/"));
}

/** U-11 : boîte de réception unique ; chaque onglet garde son adresse (liens des notifications et du tableau de bord inchangés). */
export const INBOX_TABS = [
  { label: "Visites et réservations", href: "/admin/requests", superAdminOnly: false },
  { label: "Demandes des locataires", href: "/admin/tenant-requests", superAdminOnly: false },
  { label: "Demandes de démo", href: "/admin/contact-requests", superAdminOnly: true },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Boîte de réception", href: "/admin/requests", icon: Inbox, also: ["/admin/tenant-requests", "/admin/contact-requests"] },
  { label: "Biens", href: "/admin/properties", icon: Building2, group: "Parc" },
  { label: "Propriétaires", href: "/admin/owners", icon: Users, group: "Parc" },
  { label: "Locataires", href: "/admin/tenants", icon: UserRound, group: "Parc" },
  { label: "Catalogue", href: "/admin/catalog", icon: LayoutGrid, group: "Parc" },
  { label: "Contrats", href: "/admin/leases", icon: FileText, group: "Locatif" },
  { label: "Paiements", href: "/admin/payments", icon: Wallet, group: "Locatif" },
  { label: "Maintenance", href: "/admin/maintenance", icon: Wrench, group: "Locatif" },
  { label: "Techniciens", href: "/admin/technicians", icon: HardHat, group: "Locatif" },
  { label: "Ventes", href: "/admin/sales", icon: Tag, group: "Ventes & séjours" },
  { label: "Courte durée", href: "/admin/short-stay", icon: CalendarRange, group: "Ventes & séjours" },
  { label: "Statistiques", href: "/admin/reports", icon: BarChart3, group: "Agence" },
  { label: "Équipe", href: "/admin/team", icon: UserCog, group: "Agence" },
  { label: "Journal d'activité", href: "/admin/audit-log", icon: History, group: "Agence" },
  { label: "Paramètres", href: "/admin/settings", icon: Settings, group: "Agence" },
  { label: "Mon profil", href: "/admin/profile", icon: UserCircle, group: "Agence" },
];

export const OWNER_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Mes biens", href: "/owner/properties", icon: Building2 },
  { label: "Mes locataires", href: "/owner/tenants", icon: UserRound },
  { label: "Paiements", href: "/owner/payments", icon: Wallet },
  { label: "Contrats", href: "/owner/leases", icon: FileText },
  { label: "Catalogue", href: "/owner/catalog", icon: LayoutGrid },
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
  { label: "Catalogue", href: "/tenant/catalog", icon: LayoutGrid },
  { label: "Résiliation & demandes", href: "/tenant/requests", icon: Mail },
  { label: "Profil", href: "/tenant/profile", icon: UserCircle },
];
