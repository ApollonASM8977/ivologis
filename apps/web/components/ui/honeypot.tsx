"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { t } from "@/lib/t-ui";

/** Champ piège anti-robots : hors écran, hors tabulation, masqué aux lecteurs d'écran. */
export function HoneypotField({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        {t("Site web")}
        <input type="text" tabIndex={-1} autoComplete="off" {...registration} />
      </label>
    </div>
  );
}
