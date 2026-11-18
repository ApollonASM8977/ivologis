import { Providers } from "@/app/providers";

/** Connexion et inscription : seules ces pages (et les espaces) chargent React Query et les notifications. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
