import { notFound } from "next/navigation";

/** Adresse inconnue : sans cette route, Next affiche sa page 404 par défaut (en anglais, hors de la mise en page du site). */
export default function Missing() {
  notFound();
}
