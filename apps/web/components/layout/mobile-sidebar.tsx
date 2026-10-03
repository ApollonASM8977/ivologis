"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Building, X } from "lucide-react";
import { NavItem } from "./nav-config";

export function MobileSidebar({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Building className="h-4 w-4" />
            </div>
            <p className="font-bold text-primary-dark">IVOLOGIS</p>
          </div>
          <button onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "bg-primary text-white" : "text-ink-muted hover:bg-gray-50",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
