// P1-07 : suivi public d'une demande par référence + téléphone, sans compte. Base de TEST uniquement (crée une
// demande de visite de test). Vérifie : formats de téléphone équivalents, aucune donnée personnelle renvoyée, même
// réponse pour « référence inconnue » et « mauvais téléphone », référence mal formée refusée, limite de 5 essais/min.
// Usage : QA_API=http://localhost:3101/api QA_ADMIN=<jeton agence, pour retrouver une réservation> node test/qa-suivi.mjs
const API = process.env.QA_API ?? "http://localhost:3101/api";
if (/onrender\.com|ivologis\.ci/.test(API)) {
  console.error("Refusé : ce test crée des données, jamais sur la production.");
  process.exit(2);
}
const ADMIN = process.env.QA_ADMIN;
const call = async (method, path, body, tok) => {
  const r = await fetch(API + path, { method, headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const track = (reference, phone) => call("GET", `/catalog/track?reference=${encodeURIComponent(reference)}&phone=${encodeURIComponent(phone)}`);
let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK " : "KO "} ${name}${detail ? ` — ${detail}` : ""}`);
};
const PERSONAL = ["guestName", "guestPhone", "guestEmail", "message", "userId", "ownerId", "tenantId", "email", "phone"];
const leaks = (body) => PERSONAL.filter((k) => JSON.stringify(body ?? {}).includes(`"${k}":`));

// 1. Un visiteur envoie une demande de visite sur une annonce publiée.
const listing = ((await call("GET", "/catalog/rentals?limit=1")).body?.data ?? [])[0] ?? ((await call("GET", "/catalog/sales?limit=1")).body?.data ?? [])[0];
if (!listing) throw new Error("Aucune annonce publiée sur cette base");
const sent = await call("POST", `/properties/${listing.id}/visit-requests`, { guestName: "Visiteur suivi QA", guestPhone: "+225 07 11 22 33 44", message: "Test du suivi public." });
const ref = sent.body?.reference;
check("demande de visite envoyée sans compte", sent.status === 201 && /^RDV-/.test(ref ?? ""), `${sent.status} ${ref}`);

// 2. Suivi (5 essais au plus par minute).
const ok = await track(ref, "+225 07 11 22 33 44");
check("suivi avec la référence et le téléphone → 200", ok.status === 200 && ok.body?.kind === "VISITE" && ok.body?.reference === ref, `statut ${ok.body?.status}`);
check("aucune donnée personnelle renvoyée", leaks(ok.body).length === 0, leaks(ok.body).join(", "));
const variant = await track(ref.toLowerCase(), "0711223344");
check("référence en minuscules et téléphone écrit autrement → 200", variant.status === 200);
const wrongPhone = await track(ref, "0700000000");
const unknown = await track("RDV-2026-00000000", "0711223344");
check("mauvais téléphone → 404", wrongPhone.status === 404);
check("référence inconnue → 404, même message (rien à deviner)", unknown.status === 404 && JSON.stringify(unknown.body?.message) === JSON.stringify(wrongPhone.body?.message), JSON.stringify(unknown.body?.message));
check("téléphone avec indicatif collé → 200 (5e essai)", (await track(ref, "+2250711223344")).status === 200);
const limited = await track(ref, "0711223344");
check("6e essai dans la minute → 429 (limite de 5)", limited.status === 429, `reçu ${limited.status}`);

// 3. Réservation courte durée (après la fenêtre de limitation) : retrouvée via l'agence sur cette base de test.
if (ADMIN) {
  console.log("… pause de 61 s (limite de débit)");
  await new Promise((r) => setTimeout(r, 61_000));
  const malformed = await track("pas-une-reference", "0711223344");
  check("référence mal formée → 400", malformed.status === 400, JSON.stringify(malformed.body?.message));
  let booking;
  for (const p of (await call("GET", "/catalog/short-stay?limit=50")).body?.data ?? []) {
    const list = (await call("GET", `/properties/${p.id}/short-stay-bookings`, undefined, ADMIN)).body ?? [];
    booking = (Array.isArray(list) ? list : list.data ?? []).find((b) => b.reference && b.guestPhone);
    if (booking) break;
  }
  if (booking) {
    const stay = await track(booking.reference, booking.guestPhone);
    check("réservation courte durée suivie → 200", stay.status === 200 && stay.body?.kind === "SEJOUR" && !!stay.body?.checkIn, `statut ${stay.body?.status}`);
    check("réservation : aucune donnée personnelle", leaks(stay.body).length === 0, leaks(stay.body).join(", "));
  } else check("réservation avec téléphone présente pour le contrôle", false, "aucune sur cette base");
}

console.log(failures ? `\n${failures} contrôle(s) en échec.` : "\nTous les contrôles réussis.");
process.exit(failures ? 1 : 0);
