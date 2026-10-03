"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { TrendingUp, ArrowRight, CalendarClock } from "lucide-react";
import { api } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";

export function RevisionsDueCard() {
  const { data } = useQuery<any[]>({
    queryKey: ["leases", "revisions", "due"],
    queryFn: async () => (await api.get("/leases/revisions/due")).data,
  });
  const rows = data ?? [];

  return (
    <Card>
      <CardHeader title="Révisions de loyer à prévoir" subtitle="Échéances dans les 30 prochains jours" />
      {rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-muted"><CalendarClock className="h-4 w-4" /> Aucune révision à prévoir pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {rows.slice(0, 6).map((r, i) => (
            <motion.li key={r.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/admin/leases/${r.id}`} className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm transition-all hover:border-primary/30 hover:bg-primary/5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{r.tenant?.fullName} · {r.property?.name}</p>
                  <p className="text-xs text-ink-muted">Échéance le {new Date(r.rentRevisionDate).toLocaleDateString("fr-FR", { dateStyle: "medium" })} · loyer {formatXOF(Number(r.rentAmount))}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary">
                  <TrendingUp className="h-3.5 w-3.5" /> Réviser <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
