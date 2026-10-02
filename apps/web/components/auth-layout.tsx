import { Building } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary-dark p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Building className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">IVOLOGIS</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            La gestion immobilière,<br />simplifiée pour la Côte d&apos;Ivoire.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Biens, locataires, contrats, paiements Mobile Money et maintenance — tout IVOLOGIS
            dans une seule plateforme.
          </p>
        </div>
        <p className="text-sm text-white/50">© {new Date().getFullYear()} IVOLOGIS — Abidjan, Côte d&apos;Ivoire</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-surface px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-primary-dark">
              <Building className="h-6 w-6" />
              <span className="text-xl font-bold">IVOLOGIS</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
