/**
 * Plan gratuit Render : le site et l'API s'endorment chacun de leur côté. Sans ceci, le premier visiteur
 * attend le réveil du site (≈ 50 s) puis, au premier écran qui lit l'API (catalogue, connexion), un second réveil.
 * Dès que le site démarre, il réveille l'API en parallèle, puis la garde éveillée tant que lui-même l'est
 * (il s'endort 15 min après le dernier visiteur : le ping s'arrête avec lui, rien ne tourne pour rien).
 */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return;
  const ping = () => fetch(`${api}/api/settings/public`, { signal: AbortSignal.timeout(90_000) }).catch(() => {});
  ping();
  setInterval(ping, 10 * 60 * 1000).unref?.();
}
