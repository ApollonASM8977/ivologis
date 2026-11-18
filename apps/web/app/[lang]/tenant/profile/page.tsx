"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { TenantForm, TenantFormValues } from "@/components/tenants/tenant-form";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { SecurityCard } from "@/components/profile/security-card";

export default function TenantProfilePage() {
  const queryClient = useQueryClient();
  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenants", "me"],
    queryFn: async () => (await api.get("/tenants/me")).data,
  });

  const updateMutation = useMutation({
    mutationFn: (values: TenantFormValues) => api.patch(`/tenants/${tenant.id}`, values),
    onSuccess: () => {
      toast.success("Profil mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["tenants", "me"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !tenant) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Vos informations personnelles" />
      <Card className="mb-4 max-w-2xl">
        <AvatarUploader />
      </Card>
      <div className="mb-4">
        <SecurityCard />
      </div>
      <Card className="max-w-2xl">
        <CardHeader title="Informations" />
        <TenantForm
          defaultValues={tenant}
          loading={updateMutation.isPending}
          submitLabel="Enregistrer"
          onSubmit={(values) => updateMutation.mutate(values)}
        />
      </Card>
    </div>
  );
}
