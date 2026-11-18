import { Providers } from "../../providers";

/** Le catalogue interroge l'API côté navigateur (filtres, demandes) : React Query n'est chargé qu'ici, pas sur l'accueil. */
export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
