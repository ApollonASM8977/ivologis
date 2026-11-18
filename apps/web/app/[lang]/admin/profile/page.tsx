"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { SecurityCard } from "@/components/profile/security-card";
import { useAuthStore } from "@/lib/auth-store";
import { USER_ROLE_LABELS } from "@ivologis/shared";
import { t } from "@/lib/t-spaces";

export default function AdminProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader title={t("Mon profil")} subtitle={t("Votre photo et vos informations de compte")} />
      <Card className="mb-4 max-w-xl">
        <AvatarUploader />
      </Card>
      <div className="mb-4">
        <SecurityCard />
      </div>
      <Card className="max-w-xl">
        <CardHeader title={t("Compte")} />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="text-ink-muted">{t("Nom complet")}</dt>
            <dd className="font-medium text-ink">{user?.fullName}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t("Rôle")}</dt>
            <dd className="font-medium text-ink">{user ? USER_ROLE_LABELS[user.role as keyof typeof USER_ROLE_LABELS] : ""}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t("Email")}</dt>
            <dd className="font-medium text-ink">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">{t("Téléphone")}</dt>
            <dd className="font-medium text-ink">{user?.phone}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
