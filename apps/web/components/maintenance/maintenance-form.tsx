"use client";

import { useForm } from "react-hook-form";
import { MaintenanceIssueType, MAINTENANCE_ISSUE_LABELS, MaintenancePriority, MAINTENANCE_PRIORITY_LABELS } from "@ivologis/shared";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";

export interface MaintenanceFormValues {
  issueType: MaintenanceIssueType;
  description: string;
  priority: MaintenancePriority;
}

export function MaintenanceForm({ loading, onSubmit }: { loading?: boolean; onSubmit: (v: MaintenanceFormValues) => void }) {
  const { register, handleSubmit } = useForm<MaintenanceFormValues>({
    defaultValues: { priority: MaintenancePriority.MOYENNE },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Type de problème</Label>
        <Select {...register("issueType", { required: true })}>
          {Object.values(MaintenanceIssueType).map((t) => (
            <option key={t} value={t}>
              {MAINTENANCE_ISSUE_LABELS[t]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Priorité</Label>
        <Select {...register("priority", { required: true })}>
          {Object.values(MaintenancePriority).map((p) => (
            <option key={p} value={p}>
              {MAINTENANCE_PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Description du problème</Label>
        <Textarea rows={4} placeholder="Décrivez le problème en détail..." {...register("description", { required: true })} />
      </div>
      <Button type="submit" className="w-full" loading={loading}>
        Envoyer la demande
      </Button>
    </form>
  );
}
