"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface PublicCompany {
  companyName: string;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappPhone?: string | null;
  legalName?: string | null;
  rccmNumber?: string | null;
  taxNumber?: string | null;
  agentLicenseNumber?: string | null;
  artciNumber?: string | null;
  publicationDirector?: string | null;
}

export function usePublicCompany() {
  return useQuery<PublicCompany>({
    queryKey: ["company", "public"],
    queryFn: async () => (await api.get("/settings/public")).data,
    staleTime: 60 * 60 * 1000,
  });
}
