"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/empty-state";
import { OwnerForm, OwnerFormValues } from "@/components/owners/owner-form";
import { AvatarUploader } from "@/components/profile/avatar-uploader";

export default function OwnerProfilePage() {
  const queryClient = useQueryClient();
  const { data: owner, isLoading } = useQuery({
    queryKey: ["owners", "me"],
    queryFn: async () => (await api.get("/owners/me")).data,
  });

  const updateMutation = useMutation({
    mutationFn: (values: OwnerFormValues) => api.patch(`/owners/${owner.id}`, values),
    onSuccess: () => {
      toast.success("Profil mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["owners", "me"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  if (isLoading || !owner) return <LoadingState />;

  return (
    <div>
      <PageHeader title="Mon profil" subtitle="Vos informations personnelles" />
      <Card className="mb-4 max-w-xl">
        <AvatarUploader />
      </Card>
      <Card className="max-w-xl">
        <CardHeader title="Informations" />
        <OwnerForm
          defaultValues={owner}
          showPassword={false}
          loading={updateMutation.isPending}
          submitLabel="Enregistrer"
          onSubmit={(values) => updateMutation.mutate(values)}
        />
      </Card>
    </div>
  );
}
