"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ClipboardCheck, Plus, Trash2, Camera, Wallet, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, apiErrorMessage, fileUrl } from "@/lib/api";
import { formatXOF } from "@ivologis/shared";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/dashboard/count-up";

export const CONDITIONS: Record<string, string> = {
  NEUF: "Neuf",
  BON: "Bon état",
  USAGE: "Usage normal",
  DEGRADE: "Dégradé",
  MAUVAIS: "Mauvais état",
};

interface RoomForm {
  name: string;
  condition: string;
  notes: string;
  photoUrls: string[];
}

interface InspectionForm {
  inspectionDate: string;
  generalNotes: string;
  rooms: RoomForm[];
}

interface Inspection {
  id: string;
  type: "ENTREE" | "SORTIE";
  inspectionDate: string;
  rooms: RoomForm[];
  generalNotes?: string | null;
}

function RoomPhotos({ index, form, leaseId }: { index: number; form: ReturnType<typeof useForm<InspectionForm>>; leaseId: string }) {
  const photos = form.watch(`rooms.${index}.photoUrls`) ?? [];
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return (await api.post(`/leases/${leaseId}/inspections/photo`, body)).data as { url: string };
    },
    onSuccess: (res) => form.setValue(`rooms.${index}.photoUrls`, [...photos, res.url]),
    onError: (error) => toast.error(apiErrorMessage(error)),
  });
  return (
    <div className="flex flex-wrap items-center gap-2">
      {photos.map((url, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={url + i} src={fileUrl(url)} alt={`Photo ${i + 1}`} className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200" />
      ))}
      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:border-primary hover:text-primary">
        <Camera className="h-3.5 w-3.5" />
        {upload.isPending ? "Envoi…" : "Ajouter une photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function InspectionFormView({ leaseId, type, onDone }: { leaseId: string; type: "ENTREE" | "SORTIE"; onDone: () => void }) {
  const queryClient = useQueryClient();
  const form = useForm<InspectionForm>({
    defaultValues: {
      inspectionDate: new Date().toISOString().slice(0, 10),
      generalNotes: "",
      rooms: [
        { name: "Entrée", condition: "BON", notes: "", photoUrls: [] },
        { name: "Salon", condition: "BON", notes: "", photoUrls: [] },
        { name: "Cuisine", condition: "BON", notes: "", photoUrls: [] },
        { name: "Chambre", condition: "BON", notes: "", photoUrls: [] },
        { name: "Salle d'eau", condition: "BON", notes: "", photoUrls: [] },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "rooms" });

  const save = useMutation({
    mutationFn: (values: InspectionForm) =>
      api.post(`/leases/${leaseId}/inspections`, {
        type,
        inspectionDate: values.inspectionDate,
        generalNotes: values.generalNotes || undefined,
        rooms: values.rooms.map((r) => ({ name: r.name, condition: r.condition, notes: r.notes || undefined, photoUrls: r.photoUrls })),
      }),
    onSuccess: () => {
      toast.success(`État des lieux ${type === "ENTREE" ? "d'entrée" : "de sortie"} enregistré.`);
      queryClient.invalidateQueries({ queryKey: ["leases", leaseId] });
      onDone();
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="insp-date">Date de l&apos;état des lieux</Label>
          <Input id="insp-date" type="date" {...form.register("inspectionDate", { required: true })} />
        </div>
      </div>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <motion.div key={field.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-gray-100 p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input aria-label={`Nom de la pièce ${index + 1}`} {...form.register(`rooms.${index}.name`, { required: true, maxLength: 80 })} />
              <Select aria-label={`État de la pièce ${index + 1}`} {...form.register(`rooms.${index}.condition`)}>
                {Object.entries(CONDITIONS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
              <button type="button" onClick={() => remove(index)} aria-label={`Supprimer la pièce ${index + 1}`} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Input className="mt-3" placeholder="Remarques (fissures, peinture, équipements…)" aria-label={`Remarques pièce ${index + 1}`} {...form.register(`rooms.${index}.notes`)} />
            <div className="mt-3">
              <RoomPhotos index={index} form={form} leaseId={leaseId} />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => append({ name: "", condition: "BON", notes: "", photoUrls: [] })}>
          <Plus className="h-4 w-4" /> Ajouter une pièce
        </Button>
      </div>
      <div>
        <Label htmlFor="insp-notes">Observations générales</Label>
        <Textarea id="insp-notes" rows={2} {...form.register("generalNotes")} />
      </div>
      <Button type="submit" loading={save.isPending}>Enregistrer l&apos;état des lieux</Button>
    </form>
  );
}

function ComparisonView({ leaseId }: { leaseId: string }) {
  const { data } = useQuery({
    queryKey: ["leases", leaseId, "compare"],
    queryFn: async () => (await api.get(`/leases/${leaseId}/inspections/compare`)).data,
  });
  if (!data?.entry || !data?.exit) {
    return <p className="text-sm text-ink-muted">La comparaison est disponible dès que les états des lieux d&apos;entrée et de sortie sont enregistrés.</p>;
  }
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${data.worsenedCount ? "bg-amber-50 text-amber-800" : "bg-success/10 text-green-800"}`}>
        {data.worsenedCount ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {data.worsenedCount ? `${data.worsenedCount} pièce(s) dégradée(s) depuis l'entrée` : "Aucune dégradation relevée entre l'entrée et la sortie"}
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5">Pièce</th>
              <th scope="col" className="px-4 py-2.5">Entrée</th>
              <th scope="col" className="px-4 py-2.5">Sortie</th>
              <th scope="col" className="px-4 py-2.5">Remarques</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.rows.map((row: any) => (
              <tr key={row.room}>
                <td className="px-4 py-2.5 font-medium text-ink">{row.room}</td>
                <td className="px-4 py-2.5 text-ink-muted">{row.entryCondition ? CONDITIONS[row.entryCondition] : "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={row.worsened ? "font-semibold text-danger" : "text-ink"}>{CONDITIONS[row.exitCondition]}</span>
                </td>
                <td className="px-4 py-2.5 text-ink-muted">{row.exitNotes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InspectionsCard({ leaseId }: { leaseId: string }) {
  const [creating, setCreating] = useState<"ENTREE" | "SORTIE" | null>(null);
  const { data: inspections } = useQuery<Inspection[]>({
    queryKey: ["leases", leaseId, "inspections"],
    queryFn: async () => (await api.get(`/leases/${leaseId}/inspections`)).data,
  });
  const entry = inspections?.find((i) => i.type === "ENTREE");
  const exit = inspections?.find((i) => i.type === "SORTIE");

  return (
    <Card>
      <CardHeader title="États des lieux" subtitle="Entrée, sortie et comparaison pièce par pièce" />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["ENTREE", "SORTIE"] as const).map((type) => {
          const existing = type === "ENTREE" ? entry : exit;
          return (
            <Button key={type} size="sm" variant={existing ? "ghost" : "secondary"} onClick={() => setCreating(type)} disabled={!!existing}>
              <ClipboardCheck className="h-4 w-4" />
              {existing ? `${type === "ENTREE" ? "Entrée" : "Sortie"} enregistrée le ${new Date(existing.inspectionDate).toLocaleDateString("fr-FR")}` : `Créer l'état des lieux ${type === "ENTREE" ? "d'entrée" : "de sortie"}`}
            </Button>
          );
        })}
      </div>
      {creating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-xl bg-surface p-4">
          <InspectionFormView leaseId={leaseId} type={creating} onDone={() => setCreating(null)} />
        </motion.div>
      )}
      <ComparisonView leaseId={leaseId} />
    </Card>
  );
}

function DepositCard({ lease }: { lease: any }) {
  const queryClient = useQueryClient();
  const deposit = Number(lease.deposit);
  const form = useForm<{ deductions: { label: string; amount: number }[] }>({ defaultValues: { deductions: [] } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "deductions" });
  const deductions = form.watch("deductions") ?? [];
  const total = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const refund = deposit - total;
  const ended = lease.status !== "ACTIVE" || new Date(lease.endDate).getTime() < Date.now();

  const settle = useMutation({
    mutationFn: (values: { deductions: { label: string; amount: number }[] }) =>
      api.post(`/leases/${lease.id}/deposit-settlement`, { deductions: values.deductions.map((d) => ({ label: d.label, amount: Number(d.amount) })) }),
    onSuccess: () => {
      toast.success("Restitution du dépôt enregistrée.");
      queryClient.invalidateQueries({ queryKey: ["leases", lease.id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Card>
      <CardHeader title="Restitution du dépôt de garantie" subtitle={`Dépôt versé : ${formatXOF(deposit)}`} />
      {lease.depositSettledAt ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-muted">Restitution réglée le {new Date(lease.depositSettledAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}.</p>
          <p className="text-2xl font-bold text-ink"><CountUp value={Number(lease.depositRefund ?? 0)} format={(n) => formatXOF(n)} /></p>
          <ul className="space-y-1 text-sm">
            {((lease.depositDeductions ?? []) as { label: string; amount: number }[]).map((d, i) => (
              <li key={i} className="flex justify-between border-b border-gray-100 py-1">
                <span className="text-ink-muted">{d.label}</span>
                <span className="font-medium">{formatXOF(d.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : !ended ? (
        <p className="text-sm text-ink-muted">La restitution se calcule à la fin du bail.</p>
      ) : (
        <form onSubmit={form.handleSubmit((v) => settle.mutate(v))} className="space-y-4">
          {fields.map((f, i) => (
            <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]">
              <Input aria-label={`Motif de retenue ${i + 1}`} placeholder="Ex : peinture, carreau cassé" {...form.register(`deductions.${i}.label`, { required: true, maxLength: 160 })} />
              <Input aria-label={`Montant de retenue ${i + 1}`} type="number" min={0} {...form.register(`deductions.${i}.amount`, { required: true, valueAsNumber: true, min: 0 })} />
              <button type="button" onClick={() => remove(i)} aria-label={`Supprimer la retenue ${i + 1}`} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ label: "", amount: 0 })}>
            <Plus className="h-4 w-4" /> Ajouter une retenue
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-sm">
            <span>Retenues : <strong>{formatXOF(total)}</strong></span>
            <span className={refund < 0 ? "font-semibold text-danger" : "font-semibold text-success"}>
              Restitution : {formatXOF(Math.max(0, refund))}
            </span>
          </div>
          {refund < 0 && <p className="text-sm text-danger">Les retenues dépassent le dépôt de garantie.</p>}
          <Button type="submit" loading={settle.isPending} disabled={refund < 0}>Valider la restitution</Button>
        </form>
      )}
    </Card>
  );
}

function RevisionCard({ lease }: { lease: any }) {
  const queryClient = useQueryClient();
  const form = useForm<{ newRent: number; effectiveDate: string }>({
    defaultValues: { newRent: Number(lease.rentAmount), effectiveDate: new Date().toISOString().slice(0, 10) },
  });
  const newRent = Number(form.watch("newRent")) || 0;
  const current = Number(lease.rentAmount);
  const rate = current > 0 ? ((newRent / current - 1) * 100).toFixed(2) : "0";
  const next = lease.rentRevisionDate ? new Date(lease.rentRevisionDate) : null;

  const revise = useMutation({
    mutationFn: (values: { newRent: number; effectiveDate: string }) =>
      api.post(`/leases/${lease.id}/revision`, { newRent: Number(values.newRent), effectiveDate: values.effectiveDate }),
    onSuccess: () => {
      toast.success("Loyer révisé.");
      queryClient.invalidateQueries({ queryKey: ["leases", lease.id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Card>
      <CardHeader title="Révision du loyer" subtitle="Selon la clause de révision prévue au bail" />
      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface p-3">
          <p className="text-ink-muted">Loyer actuel</p>
          <p className="font-semibold text-ink">{formatXOF(current)}</p>
        </div>
        <div className="rounded-xl bg-surface p-3">
          <p className="text-ink-muted">Prochaine révision</p>
          <p className="font-semibold text-ink">{next ? next.toLocaleDateString("fr-FR", { dateStyle: "medium" }) : "—"}</p>
        </div>
      </div>
      {lease.revisionRatePercent !== null && lease.revisionRatePercent !== undefined && (
        <p className="mb-4 flex items-center gap-2 text-sm text-ink-muted"><TrendingUp className="h-4 w-4" /> Dernière révision : {Number(lease.revisionRatePercent).toFixed(2)} %</p>
      )}
      <form onSubmit={form.handleSubmit((v) => revise.mutate(v))} className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="rev-rent">Nouveau loyer (FCFA)</Label>
          <Input id="rev-rent" type="number" min={1} {...form.register("newRent", { required: true, valueAsNumber: true, min: 1 })} />
        </div>
        <div>
          <Label htmlFor="rev-date">Date d&apos;effet</Label>
          <Input id="rev-date" type="date" {...form.register("effectiveDate", { required: true })} />
        </div>
        <div className="flex items-end">
          <Button type="submit" loading={revise.isPending} className="w-full">
            Réviser <Badge color={Number(rate) >= 0 ? "green" : "red"}>{rate} %</Badge>
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function LeaseOperations({ lease }: { lease: any }) {
  return (
    <div className="mt-4 space-y-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted"><Wallet className="h-3.5 w-3.5" /> Exploitation du bail</p>
      <InspectionsCard leaseId={lease.id} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DepositCard lease={lease} />
        <RevisionCard lease={lease} />
      </div>
    </div>
  );
}
