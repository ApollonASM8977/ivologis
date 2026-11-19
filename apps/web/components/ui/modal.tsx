"use client";

import { X } from "lucide-react";
import { useEffect, useId } from "react";
import { t } from "@/lib/t-ui";
import { useFocusTrap } from "@/lib/use-focus-trap";

/** Fenêtre modale : fondu du fond et zoom du panneau en CSS (`ivo-fade-in`, `ivo-zoom-in`), sans bibliothèque. */
export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  const titleId = useId();
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ivo-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`ivo-zoom-in w-full ${width} max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} aria-label={t("Fermer")} className="rounded-full p-1 text-ink-muted transition hover:rotate-90 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
