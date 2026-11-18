"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { HoneypotField } from "@/components/ui/honeypot";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n-client";
import { contactMessages } from "@/messages/contact";

interface ContactValues {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  portfolioSize?: string;
  message: string;
  website?: string;
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactValues>();
  const m = contactMessages[useLang()];

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
    <>
      {sent ? (
        <div
          key="ok"
          className="ivo-fade-in flex flex-col items-center gap-3 rounded-2xl border border-success/20 bg-success/5 p-10 text-center"
          role="status"
        >
          <CheckCircle2 className="h-12 w-12 text-success" />
          <p className="text-lg font-semibold text-ink">{m.sentTitle}</p>
          <p className="text-sm text-ink-muted">{m.sentText}</p>
          <button type="button" onClick={() => setSent(false)} className="mt-2 text-sm font-medium text-primary hover:underline">
            {m.sendAnother}
          </button>
        </div>
      ) : (
        <form
          key="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="ivo-fade-in relative grid gap-4 sm:grid-cols-2"
        >
          <HoneypotField registration={register("website")} />
          <div>
            <Label htmlFor="c-name">{m.fullName}</Label>
            <Input id="c-name" autoComplete="name" aria-invalid={!!errors.fullName} {...register("fullName", { required: m.fullNameRequired, minLength: { value: 2, message: m.fullNameShort } })} />
            {errors.fullName && <p role="alert" className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
          </div>
          <div>
            <Label htmlFor="c-email">{m.email}</Label>
            <Input id="c-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email", { required: m.emailRequired, pattern: { value: /^\S+@\S+\.\S+$/, message: m.emailInvalid } })} />
            {errors.email && <p role="alert" className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="c-phone">{m.phone}</Label>
            <Input id="c-phone" type="tel" autoComplete="tel" placeholder="+225 07 00 00 00 00" {...register("phone")} />
          </div>
          <div>
            <Label htmlFor="c-org">{m.organization}</Label>
            <Input id="c-org" autoComplete="organization" {...register("organization")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="c-size">{m.size}</Label>
            <Select id="c-size" defaultValue="" {...register("portfolioSize")}>
              <option value="">{m.choose}</option>
              <option value="1-10">{m.sizes.small}</option>
              <option value="11-50">{m.sizes.medium}</option>
              <option value="50+">{m.sizes.large}</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="c-message">{m.message}</Label>
            <Textarea id="c-message" rows={4} aria-invalid={!!errors.message} {...register("message", { required: m.messageRequired, minLength: { value: 10, message: m.messageShort } })} />
            {errors.message && <p role="alert" className="mt-1 text-xs text-danger">{errors.message.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto" loading={loading}>
              {m.submit}
            </Button>
          </div>
        </form>
      )}
    </>
  );
}
