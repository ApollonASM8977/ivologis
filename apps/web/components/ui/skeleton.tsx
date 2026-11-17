import { HouseLoader } from "@/components/ui/house-loader";
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`} />;
}

/** Chargement d'un écran : la maison qui se construit (voir house-loader.tsx). */
export function LoadingState({ label = "Chargement en cours", hint }: { label?: string; hint?: string }) {
  return <HouseLoader label={label} hint={hint} />;
}
