export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN_AGENT = "ADMIN_AGENT",
  OWNER = "OWNER",
  TENANT = "TENANT",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  PENDING = "PENDING",
}

export enum PropertyType {
  VILLA = "VILLA",
  APPARTEMENT = "APPARTEMENT",
  STUDIO = "STUDIO",
  TERRAIN = "TERRAIN",
  IMMEUBLE = "IMMEUBLE",
  BUREAU = "BUREAU",
  MAGASIN = "MAGASIN",
}

export enum PropertyStatus {
  VACANT = "VACANT",
  LOUE = "LOUE",
  MAINTENANCE = "MAINTENANCE",
  SUSPENDU = "SUSPENDU",
}

export enum LeaseStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED",
}

export enum LeaseType {
  HABITATION_NUE = "HABITATION_NUE",
  HABITATION_MEUBLEE = "HABITATION_MEUBLEE",
  COMMERCIAL = "COMMERCIAL",
  PROFESSIONNEL = "PROFESSIONNEL",
  TERRAIN = "TERRAIN",
}

export enum MaritalStatus {
  CELIBATAIRE = "CELIBATAIRE",
  MARIE = "MARIE",
  DIVORCE = "DIVORCE",
  VEUF = "VEUF",
}

export enum SignatureStatus {
  SIGNED = "SIGNED",
  UNSIGNED = "UNSIGNED",
}

export enum PaymentMethod {
  ORANGE_MONEY = "ORANGE_MONEY",
  MTN_MONEY = "MTN_MONEY",
  MOOV_MONEY = "MOOV_MONEY",
  WAVE = "WAVE",
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export enum PaymentStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  LATE = "LATE",
  CANCELLED = "CANCELLED",
}

export enum MaintenanceIssueType {
  EAU = "EAU",
  ELECTRICITE = "ELECTRICITE",
  PLOMBERIE = "PLOMBERIE",
  SERRURE = "SERRURE",
  PEINTURE = "PEINTURE",
  AUTRE = "AUTRE",
}

export enum MaintenancePriority {
  FAIBLE = "FAIBLE",
  MOYENNE = "MOYENNE",
  URGENTE = "URGENTE",
}

export enum MaintenanceStatus {
  RECU = "RECU",
  EN_COURS = "EN_COURS",
  RESOLU = "RESOLU",
  REJETE = "REJETE",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  SMS = "SMS",
  WHATSAPP = "WHATSAPP",
}

export enum DocumentType {
  CNI = "CNI",
  PASSEPORT = "PASSEPORT",
  ATTESTATION_RESIDENCE = "ATTESTATION_RESIDENCE",
  QUITTANCE = "QUITTANCE",
  CONTRAT = "CONTRAT",
  AUTRE = "AUTRE",
}
