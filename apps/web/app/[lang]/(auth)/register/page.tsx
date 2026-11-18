"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore, ROLE_HOME } from "@/lib/auth-store";
import { UserRole } from "@ivologis/shared";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  inviteCode?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm<RegisterForm>({
    defaultValues: { role: UserRole.OWNER },
  });
  const password = watch("password");
  const isTenant = watch("role") === UserRole.TENANT;

  async function onSubmit({ inviteCode, ...values }: RegisterForm) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", inviteCode?.trim() ? { ...values, inviteCode: inviteCode.trim() } : values);
      setSession(data.accessToken, data.user);
      toast.success("Compte créé avec succès !");
      router.push(ROLE_HOME[data.user.role as keyof typeof ROLE_HOME] ?? "/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Propriétaires et locataires suivis par l'agence">
      <form onSubmit={handleSubmit(onSubmit)}>
        <StaggerContainer className="space-y-4">
          <StaggerItem>
            <Label>Je suis</Label>
            <Select {...register("role")}>
              <option value={UserRole.OWNER}>Propriétaire</option>
              <option value={UserRole.TENANT}>Locataire</option>
            </Select>
          </StaggerItem>
          <StaggerItem>
            <Label htmlFor="invite-code">Code d&apos;invitation{isTenant ? "" : " (si l'agence vous en a donné un)"}</Label>
            <Input
              id="invite-code"
              autoComplete="off"
              placeholder="Ex : K7PM 3QX9"
              className="font-mono uppercase tracking-widest"
              {...register("inviteCode", { required: isTenant })}
            />
            <p className="mt-1 text-xs text-ink-muted">
              {isTenant
                ? "Votre agence vous transmet ce code (par WhatsApp ou SMS) pour relier le compte à votre dossier."
                : "Avec le code, votre compte est relié aux biens que l'agence gère déjà pour vous. Sans code, vous démarrez un espace vide."}
            </p>
          </StaggerItem>
          <StaggerItem>
            <Label>Nom complet</Label>
            <Input placeholder="Ex : Kouadio Jean" {...register("fullName", { required: true })} />
          </StaggerItem>
          <StaggerItem>
            <Label>Email</Label>
            <Input type="email" placeholder="vous@exemple.ci" {...register("email", { required: true })} />
          </StaggerItem>
          <StaggerItem>
            <Label>Téléphone</Label>
            <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
          </StaggerItem>
          <StaggerItem>
            <Label>Mot de passe</Label>
            <Input type="password" placeholder="8 caractères minimum" {...register("password", { required: true, minLength: 8 })} />
            <PasswordStrengthMeter password={password} />
          </StaggerItem>

          <StaggerItem>
            <Button type="submit" className="w-full" loading={loading}>
              Créer mon compte
            </Button>
          </StaggerItem>
        </StaggerContainer>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  );
}
