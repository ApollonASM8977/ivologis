"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/empty-state";

interface ProfileForm {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  profession?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export default function TenantProfilePage() {
  const queryClient = useQueryClient();
  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenants", "me"],
    queryFn: async () => (await api.get("/tenants/me")).data,
  });

  const { register, handleSubmit, reset } = useForm<ProfileForm>();

  useEffect(() => {
    if (tenant) reset(tenant);
  }, [tenant, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: ProfileForm) => api.patch(`/tenants/${tenant.id}`, values),
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
      <Card className="max-w-xl">
        <CardHeader title="Informations" />
        <form onSubmit={handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
          <div>
            <Label>Nom complet</Label>
            <Input {...register("fullName", { required: true })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input {...register("phone", { required: true })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div>
            <Label>Adresse</Label>
            <Input {...register("address")} />
          </div>
          <div>
            <Label>Profession</Label>
            <Input {...register("profession")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact d&apos;urgence — Nom</Label>
              <Input {...register("emergencyContactName")} />
            </div>
            <div>
              <Label>Contact d&apos;urgence — Téléphone</Label>
              <Input {...register("emergencyContactPhone")} />
            </div>
          </div>
          <Button type="submit" loading={updateMutation.isPending}>
            Enregistrer
          </Button>
        </form>
      </Card>
    </div>
  );
}
