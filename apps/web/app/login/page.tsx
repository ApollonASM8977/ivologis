"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore, ROLE_HOME } from "@/lib/auth-store";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

interface LoginForm {
  identifier: string;
  password: string;
  code?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needs2fa, setNeeds2fa] = useState(false);
  const { register, handleSubmit } = useForm<LoginForm>();

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    try {
      const payload = {
        identifier: values.identifier,
        password: values.password,
        ...(needs2fa && values.code ? { code: values.code.trim() } : {}),
      };
      const { data } = await api.post("/auth/login", payload);
      if (data.requires2fa) {
        setNeeds2fa(true);
        setLoading(false);
        toast.message("Saisissez le code affiché dans votre application d'authentification.");
        return;
      }
      setSession(data.accessToken, data.user);
      toast.success(`Bienvenue, ${data.user.fullName.split(" ")[0]} !`);
      setSuccess(true);
      setTimeout(() => {
        router.push(ROLE_HOME[data.user.role as keyof typeof ROLE_HOME] ?? "/login");
      }, 550);
    } catch (error) {
      toast.error(apiErrorMessage(error));
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Connexion" subtitle="Accédez à votre espace IVOLOGIS">
      <div className="relative">
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-surface/95 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15"
              >
                <Check className="h-7 w-7 text-success" strokeWidth={2.5} />
              </motion.div>
              <p className="text-sm font-medium text-ink">Connexion réussie</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)}>
          <StaggerContainer className="space-y-4">
            <StaggerItem>
              <Label>Email ou téléphone</Label>
              <Input placeholder="vous@exemple.ci" {...register("identifier", { required: true })} />
            </StaggerItem>
            <StaggerItem>
              <Label>Mot de passe</Label>
              <Input type="password" placeholder="••••••••" {...register("password", { required: true })} />
            </StaggerItem>

            <StaggerItem className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </StaggerItem>

            <AnimatePresence initial={false}>
              {needs2fa && (
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Label>Code de vérification (6 chiffres)</Label>
                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    autoFocus
                    {...register("code", { required: needs2fa, pattern: { value: /^\d{6}$/, message: "6 chiffres" } })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <StaggerItem>
              <Button type="submit" className="w-full" loading={loading}>
                {needs2fa ? "Valider le code" : "Se connecter"}
              </Button>
            </StaggerItem>
          </StaggerContainer>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Propriétaire externe sans compte ?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  );
}
