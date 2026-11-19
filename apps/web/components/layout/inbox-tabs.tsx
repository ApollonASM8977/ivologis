"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePath } from "@/lib/i18n-client";
import { useAuthStore } from "@/lib/auth-store";
import { UserRole } from "@ivologis/shared";
import { INBOX_TABS } from "./nav-config";
import { t } from "@/lib/t-spaces";

/** U-11 : onglets de la boîte de réception de l'agence (un onglet = une page, adresse inchangée). */
export function InboxTabs() {
  const pathname = usePath();
  const role = useAuthStore((s) => s.user?.role);
  return (
    <nav aria-label={t("Boîte de réception")} className="mb-5 flex gap-1 overflow-x-auto border-b border-gray-200" data-inbox-tabs>
      {INBOX_TABS.filter((tab) => !tab.superAdminOnly || role === UserRole.SUPER_ADMIN).map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "-mb-px whitespace-nowrap border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors",
              active ? "border-primary text-primary" : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {t(tab.label)}
          </Link>
        );
      })}
    </nav>
  );
}
