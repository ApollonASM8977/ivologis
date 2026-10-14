"use client";

import { ShortStayCatalog } from "@/components/catalog/short-stay-catalog";

export default function PublicCatalogShortStayPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <ShortStayCatalog basePath="/catalogue/short-stay" />
    </div>
  );
}
