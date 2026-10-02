import {
  PropertyStatus,
  PaymentStatus,
  LeaseStatus,
  MaintenanceStatus,
  AccountStatus,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  LEASE_STATUS_LABELS,
  MAINTENANCE_STATUS_LABELS,
  ACCOUNT_STATUS_LABELS,
} from "@ivologis/shared";
import { Badge } from "./ui/badge";

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <Badge color={PROPERTY_STATUS_COLORS[status]}>{PROPERTY_STATUS_LABELS[status]}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge color={PAYMENT_STATUS_COLORS[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const color = status === LeaseStatus.ACTIVE ? "green" : status === LeaseStatus.EXPIRED ? "amber" : "red";
  return <Badge color={color}>{LEASE_STATUS_LABELS[status]}</Badge>;
}

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const color =
    status === MaintenanceStatus.RESOLU
      ? "green"
      : status === MaintenanceStatus.EN_COURS
        ? "blue"
        : status === MaintenanceStatus.REJETE
          ? "red"
          : "amber";
  return <Badge color={color}>{MAINTENANCE_STATUS_LABELS[status]}</Badge>;
}

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  const color = status === AccountStatus.ACTIVE ? "green" : status === AccountStatus.SUSPENDED ? "red" : "amber";
  return <Badge color={color}>{ACCOUNT_STATUS_LABELS[status]}</Badge>;
}
