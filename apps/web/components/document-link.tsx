"use client";

import { toast } from "sonner";
import { apiErrorMessage, openDocument } from "@/lib/api";

export function DocumentLink({
  path,
  children,
  className,
  title,
  "aria-label": ariaLabel,
}: {
  path: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      className={className}
      onClick={() => openDocument(path).catch((error) => toast.error(apiErrorMessage(error)))}
    >
      {children}
    </button>
  );
}
