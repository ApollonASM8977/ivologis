"use client";

import { useEffect, useState } from "react";

/**
 * Renvoie true sur connexion lente (2g/3g) ou en mode économie de données.
 * Non disponible sur tous les navigateurs (Network Information API) :
 * renvoie false par défaut, pour ne jamais pénaliser les connexions normales.
 */
export function useSlowConnection() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string; addEventListener?: (type: string, cb: () => void) => void; removeEventListener?: (type: string, cb: () => void) => void };
    };
    const connection = nav.connection;
    if (!connection) return;

    const evaluate = () => {
      setSlow(!!connection.saveData || ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? ""));
    };
    evaluate();
    connection.addEventListener?.("change", evaluate);
    return () => connection.removeEventListener?.("change", evaluate);
  }, []);

  return slow;
}
