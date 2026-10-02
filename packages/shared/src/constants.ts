export const CURRENCY = "XOF";

export const COMMUNES_ABIDJAN = [
  "Abobo",
  "Adjamé",
  "Attécoubé",
  "Bingerville",
  "Cocody",
  "Koumassi",
  "Marcory",
  "Plateau",
  "Port-Bouët",
  "Riviera",
  "Treichville",
  "Yopougon",
];

export const AUTRES_VILLES = [
  "Bouaké",
  "Daloa",
  "Yamoussoukro",
  "San-Pédro",
  "Korhogo",
  "Man",
  "Gagnoa",
  "Abengourou",
];

export const VILLES_CI = ["Abidjan", ...AUTRES_VILLES];

/** Formate un montant en Francs CFA, ex: formatXOF(250000) -> "250 000 FCFA" */
export function formatXOF(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

export const PERMISSION_KEYS = {
  PROPERTIES_MANAGE: "properties.manage",
  OWNERS_MANAGE: "owners.manage",
  TENANTS_MANAGE: "tenants.manage",
  LEASES_MANAGE: "leases.manage",
  PAYMENTS_MANAGE: "payments.manage",
  MAINTENANCE_MANAGE: "maintenance.manage",
  REPORTS_VIEW: "reports.view",
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
} as const;

export type PermissionKey =
  (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  [PERMISSION_KEYS.PROPERTIES_MANAGE]: "Gérer les biens",
  [PERMISSION_KEYS.OWNERS_MANAGE]: "Gérer les propriétaires",
  [PERMISSION_KEYS.TENANTS_MANAGE]: "Gérer les locataires",
  [PERMISSION_KEYS.LEASES_MANAGE]: "Gérer les contrats",
  [PERMISSION_KEYS.PAYMENTS_MANAGE]: "Vérifier les paiements",
  [PERMISSION_KEYS.MAINTENANCE_MANAGE]: "Suivre la maintenance",
  [PERMISSION_KEYS.REPORTS_VIEW]: "Voir les statistiques",
  [PERMISSION_KEYS.SETTINGS_MANAGE]: "Gérer les paramètres",
  [PERMISSION_KEYS.USERS_MANAGE]: "Gérer les comptes admin",
};
