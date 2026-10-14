"use client";

import { SalesCatalog } from "@/components/catalog/sales-catalog";

export default function PublicCatalogSalesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <SalesCatalog basePath="/catalogue/sales" />
    </div>
  );
}
