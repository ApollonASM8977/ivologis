import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="ivo-fade-in flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center"
    >
      <div
        className="ivo-logo-in mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
      >
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { LoadingState } from "./skeleton";
