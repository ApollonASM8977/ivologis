import type { HTMLAttributes } from "react";

/**
 * Apparition en cascade des enfants, en CSS (`.stagger-children` de globals.css : montée décalée de 60 ms par élément).
 * Auparavant en JavaScript avec une opacité de départ à 0 : le contenu restait invisible tant que le script n'avait pas tourné.
 */
export function StaggerContainer({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`stagger-children ${className}`} {...props} />;
}

export function StaggerItem(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
