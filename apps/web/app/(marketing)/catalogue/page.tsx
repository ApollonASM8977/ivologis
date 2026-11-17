import type { Metadata } from "next";
import { CatalogHub } from "@/components/catalog/catalog-hub";

export const metadata: Metadata = {
  title: "Annonces immobilières à Abidjan et en Côte d'Ivoire",
  description: "Logements à louer, terrains et maisons à vendre, résidences meublées : annonces publiées et vérifiées par l'agence, prix en FCFA.",
};

export default function PublicCatalogHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <CatalogHub basePath="/catalogue" />
    </div>
  );
}
