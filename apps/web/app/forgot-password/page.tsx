"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { MailCheck } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger";

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
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-3 rounded-xl bg-green-50 p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15"
            >
              <MailCheck className="h-6 w-6 text-success" />
            </motion.div>
            <p className="text-sm text-green-700">
              Si ce compte existe, un lien de réinitialisation a été envoyé à cette adresse.
            </p>
          </motion.div>
        ) : (
          <form key="form" onSubmit={handleSubmit(onSubmit)}>
            <StaggerContainer className="space-y-4">
              <StaggerItem>
                <Label>Email</Label>
                <Input type="email" placeholder="vous@exemple.ci" {...register("email", { required: true })} />
              </StaggerItem>
              <StaggerItem>
                <Button type="submit" className="w-full" loading={loading}>
                  Envoyer le lien
                </Button>
              </StaggerItem>
            </StaggerContainer>
          </form>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
