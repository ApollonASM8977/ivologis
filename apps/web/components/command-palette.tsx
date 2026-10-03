"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Search, CornerDownLeft, Building2, UserRound, Users, FileText, LayoutDashboard } from "lucide-react";
import { api } from "@/lib/api";
import { useDebouncedValue } from "@/components/ui/search-input";
import { ADMIN_NAV } from "@/components/layout/nav-config";

interface Option {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group: "Pages" | "Biens" | "Locataires" | "Propriétaires" | "Contrats";
  icon: typeof Search;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebouncedValue(query.trim(), 200);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const { data } = useQuery({
    queryKey: ["search", debounced],
    queryFn: async () => (await api.get("/search", { params: { q: debounced } })).data,
    enabled: open && debounced.length >= 2,
  });

  const options = useMemo<Option[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: Option[] = ADMIN_NAV.filter((n) => !q || n.label.toLowerCase().includes(q)).map((n) => ({
      id: `page-${n.href}`,
      label: n.label,
      href: n.href,
      group: "Pages",
      icon: n.icon ?? LayoutDashboard,
    }));
    const results: Option[] = data
      ? [
          ...(data.properties ?? []).map((p: any) => ({ id: `p-${p.id}`, label: p.name, hint: p.commune, href: `/admin/properties/${p.id}`, group: "Biens" as const, icon: Building2 })),
          ...(data.tenants ?? []).map((t: any) => ({ id: `t-${t.id}`, label: t.fullName, hint: t.phone, href: `/admin/tenants/${t.id}`, group: "Locataires" as const, icon: UserRound })),
          ...(data.owners ?? []).map((o: any) => ({ id: `o-${o.id}`, label: o.fullName, hint: o.phone, href: `/admin/owners/${o.id}`, group: "Propriétaires" as const, icon: Users })),
          ...(data.leases ?? []).map((l: any) => ({ id: `l-${l.id}`, label: l.contractNumber, hint: l.tenant?.fullName, href: `/admin/leases/${l.id}`, group: "Contrats" as const, icon: FileText })),
        ]
      : [];
    return [...results, ...pages];
  }, [query, data]);

  useEffect(() => setActive(0), [query]);

  function go(option: Option | undefined) {
    if (!option) return;
    setOpen(false);
    router.push(option.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Recherche rapide"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 px-4">
              <Search className="h-4 w-4 text-ink-muted" />
              <input
                autoFocus
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={options[active] ? `opt-${options[active].id}` : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Rechercher un bien, un locataire, un contrat… ou une page"
                className="h-14 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
              />
              <kbd className="hidden rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] text-ink-muted sm:block">Échap</kbd>
            </div>

            <ul id="palette-list" role="listbox" className="max-h-96 overflow-y-auto p-2">
              {options.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-muted">Aucun résultat.</li>}
              {options.map((o, i) => {
                const Icon = o.icon;
                const isActive = i === active;
                const showGroup = i === 0 || options[i - 1].group !== o.group;
                return (
                  <li key={o.id} role="presentation">
                    {showGroup && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{o.group}</p>}
                    <div
                      id={`opt-${o.id}`}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(o)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-ink"}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate font-medium">{o.label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-ink-muted">
                        {o.hint && <span className="hidden sm:inline">{o.hint}</span>}
                        {isActive && <CornerDownLeft className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
