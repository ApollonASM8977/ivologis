"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const TEMPLATE = "nom_complet;telephone;email;profession;nationalite;adresse\nAïcha Koné;+2250700000111;aicha@exemple.ci;Commerçante;Ivoirienne;Cocody Riviera\n";

const HEADER_MAP: Record<string, string> = {
  "nom complet": "fullName",
  nom_complet: "fullName",
  nom: "fullName",
  telephone: "phone",
  téléphone: "phone",
  email: "email",
  profession: "profession",
  nationalite: "nationality",
  nationalité: "nationality",
  adresse: "address",
};

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim().length);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(";") ? ";" : ",";
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        quoted = !quoted;
      } else if (ch === delimiter && !quoted) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };
  const headers = split(lines[0]).map((h) => HEADER_MAP[h.toLowerCase()] ?? h);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
  });
}

function downloadTemplate() {
  const blob = new Blob([`﻿${TEMPLATE}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modele-locataires.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ImportTenantsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [result, setResult] = useState<{ created: number; errors: { line: number; message: string }[] } | null>(null);

  const submit = useMutation({
    mutationFn: async () => (await api.post("/tenants/import", { rows: rows.map((r) => ({ ...r, email: r.email || undefined, profession: r.profession || undefined, nationality: r.nationality || undefined, address: r.address || undefined })) })).data,
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      if (data.created) toast.success(`${data.created} locataire(s) importé(s).`);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function reset() {
    setRows([]);
    setResult(null);
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose(); }} title="Importer des locataires" width="max-w-2xl">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 text-sm">
          <p className="text-ink-muted">Colonnes : nom_complet, telephone (obligatoires), email, profession, nationalite, adresse.</p>
          <Button variant="ghost" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Modèle CSV
          </Button>
        </div>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 px-6 py-8 text-center text-sm text-ink-muted hover:border-primary hover:text-primary">
          <Upload className="h-6 w-6" />
          <span>Choisir un fichier CSV (200 lignes au maximum)</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setResult(null);
              setRows(parseCsv(await file.text()).slice(0, 200));
              e.target.value = "";
            }}
          />
        </label>

        {rows.length > 0 && !result && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-ink">{rows.length} ligne(s) prête(s) à être importée(s)</p>
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-ink-muted">
              {rows.slice(0, 5).map((r, i) => (
                <li key={i}>{r.fullName || "(sans nom)"} · {r.phone || "(sans téléphone)"}</li>
              ))}
              {rows.length > 5 && <li>… et {rows.length - 5} autre(s)</li>}
            </ul>
            <Button onClick={() => submit.mutate()} loading={submit.isPending} className="w-full">
              Importer {rows.length} locataire(s)
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-3" role="status">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" /> {result.created} locataire(s) créé(s)
            </p>
            {result.errors.length > 0 && (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                <p className="mb-2 flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> {result.errors.length} ligne(s) non importée(s)</p>
                <ul className="max-h-40 space-y-1 overflow-y-auto">
                  {result.errors.map((e) => (
                    <li key={e.line}>Ligne {e.line} : {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button variant="secondary" onClick={() => { reset(); onClose(); }} className="w-full">Terminer</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
