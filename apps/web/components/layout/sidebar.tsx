"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Building } from "lucide-react";
import { motion } from "motion/react";
import { NavItem } from "./nav-config";

export function Sidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-100 bg-white lg:flex">
      <motion.div
        className="flex items-center gap-2 px-6 py-5"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
          <Building className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold text-primary-dark">IVOLOGIS</p>
          <p className="text-[11px] text-ink-muted">Gestion immobilière</p>
        </div>
      </motion.div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {items.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Link
                href={item.href}
                className={clsx(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  active ? "text-white" : "text-ink-muted hover:bg-gray-50 hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  />
                )}
                <Icon className="relative z-10 h-4.5 w-4.5" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="px-6 py-4 text-[11px] text-ink-muted">© {new Date().getFullYear()} IVOLOGIS</div>
    </aside>
  );
}
