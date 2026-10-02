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

export const PROPERTY_AMENITIES = [
  "Climatisation",
  "Parking",
  "Piscine",
  "Gardiennage",
  "Groupe électrogène",
  "Forage / eau courante",
  "Internet / fibre",
  "Cour clôturée",
  "Balcon / terrasse",
  "Cuisine équipée",
] as const;

export const PAYMENT_METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ORANGE_MONEY: { bg: "#FF6600", text: "#FFFFFF", border: "#FF6600" },
  MTN_MONEY: { bg: "#FFCC00", text: "#111827", border: "#FFCC00" },
  MOOV_MONEY: { bg: "#0066CC", text: "#FFFFFF", border: "#0066CC" },
  WAVE: { bg: "#1DC8F2", text: "#001A33", border: "#1DC8F2" },
  CASH: { bg: "#16A34A", text: "#FFFFFF", border: "#16A34A" },
  BANK_TRANSFER: { bg: "#0B1F3A", text: "#FFFFFF", border: "#0B1F3A" },
};

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
