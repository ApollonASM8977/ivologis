"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm<{ newPassword: string }>();
  const newPassword = watch("newPassword");

  async function onSubmit(values: { newPassword: string }) {
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: values.newPassword });
      toast.success("Mot de passe réinitialisé. Vous pouvez vous connecter.");
      router.push("/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StaggerContainer className="space-y-4">
        <StaggerItem>
          <Label>Nouveau mot de passe</Label>
          <Input type="password" placeholder="8 caractères minimum" {...register("newPassword", { required: true, minLength: 8 })} />
          <PasswordStrengthMeter password={newPassword} />
        </StaggerItem>
        <StaggerItem>
          <Button type="submit" className="w-full" loading={loading} disabled={!token}>
            Réinitialiser
          </Button>
          {!token && <p className="mt-2 text-xs text-danger">Lien invalide : jeton manquant.</p>}
        </StaggerItem>
      </StaggerContainer>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisissez un nouveau mot de passe">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
