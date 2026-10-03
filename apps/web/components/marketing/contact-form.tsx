"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { toast } from "sonner";

interface ContactValues {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  portfolioSize?: string;
  message: string;
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactValues>();

  async function onSubmit(values: ContactValues) {
    setLoading(true);
    try {
      await api.post("/contact-requests", values);
      setSent(true);
      reset();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="ok"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-3 rounded-2xl border border-success/20 bg-success/5 p-10 text-center"
          role="status"
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
          <p className="text-lg font-semibold text-ink">Merci, votre demande est bien reçue.</p>
          <p className="text-sm text-ink-muted">Notre équipe revient vers vous sous 48 heures ouvrées.</p>
          <button type="button" onClick={() => setSent(false)} className="mt-2 text-sm font-medium text-primary hover:underline">
            Envoyer une autre demande
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <Label htmlFor="c-name">Nom complet</Label>
            <Input id="c-name" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName", { required: "Votre nom est requis.", minLength: { value: 2, message: "Nom trop court." } })} />
            {errors.fullName && <p role="alert" className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
          </div>
          <div>
            <Label htmlFor="c-email">Email professionnel</Label>
            <Input id="c-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email", { required: "Votre email est requis.", pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalide." } })} />
            {errors.email && <p role="alert" className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="c-phone">Téléphone (optionnel)</Label>
            <Input id="c-phone" type="tel" autoComplete="tel" placeholder="+225 07 00 00 00 00" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="c-org">Agence ou structure (optionnel)</Label>
            <Input id="c-org" autoComplete="organization" {...register("organization")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="c-size">Nombre de biens gérés</Label>
            <Select id="c-size" defaultValue="" {...register("portfolioSize")}>
              <option value="">Choisir</option>
              <option value="1-10">1 à 10 biens</option>
              <option value="11-50">11 à 50 biens</option>
              <option value="50+">Plus de 50 biens</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="c-message">Votre besoin</Label>
            <Textarea id="c-message" rows={4} aria-invalid={!!errors.message} {...register("message", { required: "Décrivez brièvement votre besoin.", minLength: { value: 10, message: "Au moins 10 caractères." } })} />
            {errors.message && <p role="alert" className="mt-1 text-xs text-danger">{errors.message.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto" loading={loading}>
              Envoyer ma demande
            </Button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
