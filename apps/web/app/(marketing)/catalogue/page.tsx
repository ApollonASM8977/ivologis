"use client";

import { CatalogHub } from "@/components/catalog/catalog-hub";

export default function PublicCatalogHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <CatalogHub basePath="/catalogue" />
    </div>
  );
}
