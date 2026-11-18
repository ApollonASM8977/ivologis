import { toast } from "sonner";
import { t } from "@/lib/t-ui";

/**
 * Second argument de `handleSubmit` : sans lui, un champ obligatoire vide bloque l'envoi sans rien dire.
 * react-hook-form place déjà le curseur sur le premier champ en défaut ; on explique pourquoi.
 */
export function invalidForm() {
  toast.error(t("Remplissez les champs obligatoires signalés."));
}
