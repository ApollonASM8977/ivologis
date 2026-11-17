import type { Metadata } from "next";
import { RentalsCatalog } from "@/components/catalog/rentals-catalog";

export const metadata: Metadata = {
  title: "Appartements et maisons à louer à Abidjan",
  description: "Logements à louer au mois à Abidjan : loyer, avance et caution affichés, frais d'agence encadrés. Demandez une visite sans créer de compte.",
};

export default function PublicCatalogRentalsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <RentalsCatalog basePath="/catalogue/locations" />
    </div>
  );
}
