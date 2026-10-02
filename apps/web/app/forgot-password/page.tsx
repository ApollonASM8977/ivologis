"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api, apiErrorMessage } from "@/lib/api";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  async function onSubmit(values: { email: string }) {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="Recevez un lien de réinitialisation par email">
      {sent ? (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Si ce compte existe, un lien de réinitialisation a été envoyé à cette adresse.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="vous@exemple.ci" {...register("email", { required: true })} />
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Envoyer le lien
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
