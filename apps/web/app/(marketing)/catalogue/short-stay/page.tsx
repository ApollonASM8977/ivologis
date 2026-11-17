import type { Metadata } from "next";
import { ShortStayCatalog } from "@/components/catalog/short-stay-catalog";

export const metadata: Metadata = {
  title: "Résidences meublées à la nuitée",
  description: "Résidences meublées à louer à la nuitée à Abidjan et sur la côte, disponibilités en ligne, réservation sans compte.",
};

export default function PublicCatalogShortStayPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <ShortStayCatalog basePath="/catalogue/short-stay" />
    </div>
  );
}
