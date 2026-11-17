"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Camera, X } from "lucide-react";
import { MaintenanceIssueType, MAINTENANCE_ISSUE_LABELS, MaintenancePriority, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";

export interface MaintenanceFormValues {
  issueType: MaintenanceIssueType;
  description: string;
  priority: MaintenancePriority;
  photos?: string[];
}

const MAX_PHOTOS = 5;

export function MaintenanceForm({ loading, onSubmit }: { loading?: boolean; onSubmit: (v: MaintenanceFormValues) => void }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const { register, handleSubmit, formState } = useForm<MaintenanceFormValues>({
    defaultValues: { priority: MaintenancePriority.MOYENNE },
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return (await api.post("/maintenance/photos", body)).data as { url: string };
    },
    onSuccess: (res) => setPhotos((p) => [...p, res.url].slice(0, MAX_PHOTOS)),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit({ ...v, photos }))} className="space-y-4">
      <div>
        <Label htmlFor="mf-type">Type de problème</Label>
        <Select id="mf-type" {...register("issueType", { required: true })}>
          {Object.values(MaintenanceIssueType).map((t) => (
            <option key={t} value={t}>
              {MAINTENANCE_ISSUE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="mf-priority">Urgence</Label>
        <Select id="mf-priority" {...register("priority", { required: true })}>
          {Object.values(MaintenancePriority).map((p) => (
            <option key={p} value={p}>
              {MAINTENANCE_PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <p className="mt-1 text-xs text-ink-muted">« Urgente » : fuite importante, coupure totale, porte qui ne ferme plus.</p>
      </div>
      <div>
        <Label htmlFor="mf-desc">Description du problème</Label>
        <Textarea
          id="mf-desc"
          rows={4}
          maxLength={2000}
          placeholder="Où, depuis quand, ce que vous avez constaté…"
          {...register("description", { required: "Décrivez le problème.", minLength: { value: 5, message: "5 caractères minimum." } })}
        />
        {formState.errors.description && <p className="mt-1 text-xs text-danger">{formState.errors.description.message}</p>}
      </div>
      <div>
        <Label>Photos (facultatif, {MAX_PHOTOS} maximum)</Label>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {photos.map((url) => (
              <motion.div key={url} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative h-20 w-20 overflow-hidden rounded-lg">
                <Image src={fileUrl(url) ?? ""} alt="Photo jointe" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                  aria-label="Retirer la photo"
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {photos.length < MAX_PHOTOS && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-xs text-ink-muted transition-colors hover:border-primary hover:text-primary">
              {upload.isPending ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Envoi en cours" />
              ) : (
                <>
                  <Camera className="h-5 w-5" /> Ajouter
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={upload.isPending}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload.mutate(f);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full" loading={loading} disabled={upload.isPending}>
        Envoyer la demande
      </Button>
    </form>
  );
}
