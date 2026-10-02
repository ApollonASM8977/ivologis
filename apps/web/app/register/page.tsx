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

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<RegisterForm>({
    defaultValues: { role: UserRole.OWNER },
  });

  async function onSubmit(values: RegisterForm) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", values);
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
    <AuthLayout title="Créer un compte" subtitle="Réservé aux propriétaires externes et locataires déjà enregistrés">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Je suis</Label>
          <Select {...register("role")}>
            <option value={UserRole.OWNER}>Propriétaire externe</option>
            <option value={UserRole.TENANT}>Locataire</option>
          </Select>
        </div>
        <div>
          <Label>Nom complet</Label>
          <Input placeholder="Ex : Kouadio Jean" {...register("fullName", { required: true })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="vous@exemple.ci" {...register("email", { required: true })} />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input type="password" placeholder="8 caractères minimum" {...register("password", { required: true, minLength: 8 })} />
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Créer mon compte
        </Button>
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
