"use client";

import Link from "next/link";
import { Tag, CalendarRange, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export function CatalogHub({ basePath }: { basePath: string }) {
  return (
    <div>
      <PageHeader title="Catalogue" subtitle="Biens en vente et résidences en location courte durée" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href={`${basePath}/sales`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <Tag className="h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold text-ink">Biens en vente</p>
            <p className="mt-1 text-sm text-ink-muted">Terrains, villas, appartements à vendre</p>
          </Card>
        </Link>
        <Link href={`${basePath}/short-stay`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CalendarRange className="h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold text-ink">Location courte durée</p>
            <p className="mt-1 text-sm text-ink-muted">Résidences meublées à la nuitée</p>
          </Card>
        </Link>
        <Link href={`${basePath}/my-requests`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <p className="mt-3 font-semibold text-ink">Mes demandes</p>
            <p className="mt-1 text-sm text-ink-muted">Suivi de vos RDV et réservations</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
