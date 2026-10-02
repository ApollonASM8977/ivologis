import {
  AccountStatus,
  DocumentType,
  LeaseStatus,
  MaintenanceIssueType,
  MaintenancePriority,
  MaintenanceStatus,
  PaymentMethod,
  PaymentStatus,
  PropertyStatus,
  PropertyType,
  SignatureStatus,
  UserRole,
} from "./enums";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN_AGENT]: "Agent immobilier",
  [UserRole.OWNER]: "Propriétaire",
  [UserRole.TENANT]: "Locataire",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: "Actif",
  [AccountStatus.SUSPENDED]: "Suspendu",
  [AccountStatus.PENDING]: "En attente",
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.VILLA]: "Villa",
  [PropertyType.APPARTEMENT]: "Appartement",
  [PropertyType.STUDIO]: "Studio",
  [PropertyType.TERRAIN]: "Terrain",
  [PropertyType.IMMEUBLE]: "Immeuble",
  [PropertyType.BUREAU]: "Bureau",
  [PropertyType.MAGASIN]: "Magasin",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  [PropertyStatus.VACANT]: "Vacant",
  [PropertyStatus.LOUE]: "Loué",
  [PropertyStatus.MAINTENANCE]: "En maintenance",
  [PropertyStatus.SUSPENDU]: "Suspendu",
};

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, string> = {
  [PropertyStatus.VACANT]: "amber",
  [PropertyStatus.LOUE]: "green",
  [PropertyStatus.MAINTENANCE]: "blue",
  [PropertyStatus.SUSPENDU]: "red",
};

export const LEASE_STATUS_LABELS: Record<LeaseStatus, string> = {
  [LeaseStatus.ACTIVE]: "Actif",
  [LeaseStatus.EXPIRED]: "Expiré",
  [LeaseStatus.TERMINATED]: "Résilié",
};

export const SIGNATURE_STATUS_LABELS: Record<SignatureStatus, string> = {
  [SignatureStatus.SIGNED]: "Signé",
  [SignatureStatus.UNSIGNED]: "Non signé",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.ORANGE_MONEY]: "Orange Money",
  [PaymentMethod.MTN_MONEY]: "MTN Money",
  [PaymentMethod.MOOV_MONEY]: "Moov Money",
  [PaymentMethod.WAVE]: "Wave",
  [PaymentMethod.CASH]: "Cash",
  [PaymentMethod.BANK_TRANSFER]: "Virement bancaire",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: "Payé",
  [PaymentStatus.PENDING]: "En attente",
  [PaymentStatus.LATE]: "En retard",
  [PaymentStatus.CANCELLED]: "Annulé",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: "green",
  [PaymentStatus.PENDING]: "amber",
  [PaymentStatus.LATE]: "red",
  [PaymentStatus.CANCELLED]: "gray",
};

export const MAINTENANCE_ISSUE_LABELS: Record<MaintenanceIssueType, string> = {
  [MaintenanceIssueType.EAU]: "Eau",
  [MaintenanceIssueType.ELECTRICITE]: "Électricité",
  [MaintenanceIssueType.PLOMBERIE]: "Plomberie",
  [MaintenanceIssueType.SERRURE]: "Serrure",
  [MaintenanceIssueType.PEINTURE]: "Peinture",
  [MaintenanceIssueType.AUTRE]: "Autre",
};

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  [MaintenancePriority.FAIBLE]: "Faible",
  [MaintenancePriority.MOYENNE]: "Moyenne",
  [MaintenancePriority.URGENTE]: "Urgente",
};

export const MAINTENANCE_STATUS_LABELS: Record<MaintenanceStatus, string> = {
  [MaintenanceStatus.RECU]: "Reçu",
  [MaintenanceStatus.EN_COURS]: "En cours",
  [MaintenanceStatus.RESOLU]: "Résolu",
  [MaintenanceStatus.REJETE]: "Rejeté",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.CNI]: "Carte Nationale d'Identité",
  [DocumentType.PASSEPORT]: "Passeport",
  [DocumentType.ATTESTATION_RESIDENCE]: "Attestation de résidence",
  [DocumentType.QUITTANCE]: "Quittance de loyer",
  [DocumentType.CONTRAT]: "Contrat de bail",
  [DocumentType.AUTRE]: "Autre",
};
