"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore, ROLE_HOME } from "@/lib/auth-store";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

interface LoginForm {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginForm>();

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", values);
      setSession(data.accessToken, data.user);
      toast.success(`Bienvenue, ${data.user.fullName.split(" ")[0]} !`);
      router.push(ROLE_HOME[data.user.role as keyof typeof ROLE_HOME] ?? "/login");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Connexion" subtitle="Accédez à votre espace IVOLOGIS">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Email ou téléphone</Label>
          <Input placeholder="vous@exemple.ci" {...register("identifier", { required: true })} />
        </div>
        <div>
          <Label>Mot de passe</Label>
          <Input type="password" placeholder="••••••••" {...register("password", { required: true })} />
        </div>

        <div className="flex items-center justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Propriétaire externe sans compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
