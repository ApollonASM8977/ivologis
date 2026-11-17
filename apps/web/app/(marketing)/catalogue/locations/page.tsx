"use client";

import { RentalsCatalog } from "@/components/catalog/rentals-catalog";

export default function PublicCatalogRentalsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <RentalsCatalog basePath="/catalogue/locations" />
    </div>
  );
}
