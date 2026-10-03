"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, HardHat, Phone, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { api, apiErrorMessage } from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Input, Label } from "@/components/ui/input";
import { EmptyState, LoadingState } from "@/components/ui/empty-state";

interface Technician {
  id: string;
  fullName: string;
  phone: string;
  specialty?: string;
}

interface TechnicianForm {
  fullName: string;
  phone: string;
  specialty?: string;
}

export default function AdminTechniciansPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<Technician[]>({
    queryKey: ["technicians"],
    queryFn: async () => (await api.get("/technicians")).data,
  });

  const { register, handleSubmit, reset } = useForm<TechnicianForm>();

  const createMutation = useMutation({
    mutationFn: (values: TechnicianForm) => api.post("/technicians", values),
    onSuccess: () => {
      toast.success("Technicien ajouté.");
      queryClient.invalidateQueries({ queryKey: ["technicians"] });
      setOpen(false);
      reset();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader
        title="Techniciens"
        subtitle="Prestataires disponibles pour les interventions de maintenance"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un technicien
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : data?.length === 0 ? (
        <EmptyState icon={HardHat} title="Aucun technicien enregistré" action={<Button onClick={() => setOpen(true)}>Ajouter un technicien</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HardHat className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-ink">{t.fullName}</p>
                    {t.specialty && (
                      <p className="flex items-center gap-1 text-xs text-ink-muted">
                        <Wrench className="h-3 w-3" /> {t.specialty}
                      </p>
                    )}
                  </div>
                </div>
                <a href={`tel:${t.phone}`} className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Phone className="h-3.5 w-3.5" /> {t.phone}
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Ajouter un technicien">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <Label>Nom complet</Label>
            <Input {...register("fullName", { required: true })} />
          </div>
          <div>
            <Label>Téléphone</Label>
            <Input placeholder="+225 07 00 00 00 00" {...register("phone", { required: true })} />
          </div>
          <div>
            <Label>Spécialité</Label>
            <Input placeholder="Ex : Plomberie, Électricité..." {...register("specialty")} />
          </div>
          <Button type="submit" className="w-full" loading={createMutation.isPending}>
            Ajouter
          </Button>
        </form>
      </Modal>
    </div>
  );
}
