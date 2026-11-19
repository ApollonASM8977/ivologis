// Tests de sécurité et de non-régression par rôle, à lancer contre une API de TEST (jamais la prod).
// Usage : QA_API=http://localhost:3101/api QA_ADMIN=<jeton> QA_OWNER=<jeton> QA_TENANT=<jeton> node test/qa-securite.mjs
// Aucun secret dans ce fichier : les jetons viennent de l'environnement.
const API = process.env.QA_API ?? "http://localhost:3101/api";
const T = { admin: process.env.QA_ADMIN, owner: process.env.QA_OWNER, tenant: process.env.QA_TENANT };
if (!T.admin || !T.owner || !T.tenant) {
  console.error("QA_ADMIN, QA_OWNER et QA_TENANT sont requis.");
  process.exit(2);
}
if (/onrender\.com|ivologis\.ci/.test(API)) {
  console.error("Refus : ces tests ne doivent jamais viser la production.");
  process.exit(2);
}

let failures = 0;
const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok });
  if (!ok) failures += 1;
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${name}${detail ? ` — ${detail}` : ""}`);
}
async function call(method, path, { token, body, headers = {} } = {}) {
  const r = await fetch(API + path, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* corps non JSON */ }
  return { status: r.status, json, text, headers: r.headers };
}
const hasKeyDeep = (obj, key) => JSON.stringify(obj ?? {}).includes(`"${key}":`);

// --- 1. Authentification ---
check("sans jeton → 401", (await call("GET", "/payments")).status === 401);
check("jeton falsifié → 401", (await call("GET", "/payments", { token: T.admin.slice(0, -4) + "AAAA" })).status === 401);
check("jeton « none » → 401", (await call("GET", "/payments", { token: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0." })).status === 401);

// --- 2. Matrice des droits ---
const forbidden = [
  ["tenant", "GET", "/tenants"], ["tenant", "GET", "/owners"], ["tenant", "GET", "/users"], ["tenant", "GET", "/audit-logs"],
  ["tenant", "PATCH", "/settings", {}], ["tenant", "POST", "/payments", {}], ["tenant", "POST", "/leases", {}],
  ["tenant", "GET", "/visit-requests"], ["tenant", "GET", "/reports/dashboard"],
  ["owner", "GET", "/users"], ["owner", "GET", "/audit-logs"], ["owner", "PATCH", "/settings", {}], ["owner", "POST", "/leases", {}],
  ["owner", "POST", "/payments", {}], ["owner", "GET", "/visit-requests"], ["owner", "POST", "/tenants", {}],
  ["owner", "PATCH", "/visit-requests/00000000-0000-0000-0000-000000000000/confirm", {}],
  ["owner", "PATCH", "/short-stay-bookings/00000000-0000-0000-0000-000000000000/confirm", {}],
];
for (const [role, method, path, body] of forbidden) {
  const r = await call(method, path, { token: T[role], body });
  check(`${role} ${method} ${path} → 403`, r.status === 403, `reçu ${r.status}`);
}

// --- 3. Accès aux données d'un autre client (IDOR) ---
const adminMaint = (await call("GET", "/maintenance?limit=100", { token: T.admin })).json?.data ?? [];
const tenantMaint = (await call("GET", "/maintenance?limit=100", { token: T.tenant })).json?.data ?? [];
const mineIds = new Set(tenantMaint.map((m) => m.id));
const foreign = adminMaint.find((m) => !mineIds.has(m.id));
if (foreign) check("locataire → demande de maintenance d'un autre → 403", (await call("GET", `/maintenance/${foreign.id}`, { token: T.tenant })).status === 403);
const adminProps = (await call("GET", "/properties?limit=100", { token: T.admin })).json?.data ?? [];
const ownerProps = (await call("GET", "/properties?limit=100", { token: T.owner })).json?.data ?? [];
const ownerIds = new Set(ownerProps.map((p) => p.id));
const otherProp = adminProps.find((p) => !ownerIds.has(p.id));
if (otherProp) check("propriétaire → bien d'un autre → 403", (await call("GET", `/properties/${otherProp.id}`, { token: T.owner })).status === 403);
const adminLeases = (await call("GET", "/leases?limit=100", { token: T.admin })).json?.data ?? [];
const ownerLeases = new Set(((await call("GET", "/leases?limit=100", { token: T.owner })).json?.data ?? []).map((l) => l.id));
const otherLease = adminLeases.find((l) => !ownerLeases.has(l.id));
if (otherLease) {
  check("propriétaire → bail d'un autre → 403", (await call("GET", `/leases/${otherLease.id}`, { token: T.owner })).status === 403);
  check("locataire → bail d'un autre → 403", (await call("GET", `/leases/${otherLease.id}`, { token: T.tenant })).status === 403);
}
const tenantPays = (await call("GET", "/payments?limit=100", { token: T.tenant })).json?.data ?? [];
const myTenantIds = new Set(tenantPays.map((p) => p.tenantId));
check("locataire → paiements : uniquement les siens", myTenantIds.size <= 1, `${myTenantIds.size} locataire(s) différent(s)`);

// --- 4. Tout passe par l'agence (D-11) ---
const ownerTenants = (await call("GET", "/tenants?limit=50", { token: T.owner })).json?.data ?? [];
check("propriétaire → liste locataires sans téléphone ni e-mail", !hasKeyDeep(ownerTenants, "phone") && !hasKeyDeep(ownerTenants, "email"));
if (ownerTenants[0]) {
  const t = (await call("GET", `/tenants/${ownerTenants[0].id}`, { token: T.owner })).json;
  check("propriétaire → fiche locataire sans coordonnées ni revenus", t && !("phone" in t) && !("monthlyIncome" in t) && !("idDocumentNumber" in t));
}
const ownerMaint = (await call("GET", "/maintenance?limit=50", { token: T.owner })).json?.data ?? [];
check("propriétaire → maintenance sans téléphone du locataire", ownerMaint.every((m) => !m.tenant || !("phone" in m.tenant)));
const myHome = (await call("GET", "/properties/me", { token: T.tenant })).json ?? [];
check("locataire → logement sans téléphone du propriétaire", myHome.every((p) => !p.owner || !("phone" in p.owner)));
const tenantLeases = (await call("GET", "/leases?limit=10", { token: T.tenant })).json?.data ?? [];
if (tenantLeases[0]) {
  const l = (await call("GET", `/leases/${tenantLeases[0].id}`, { token: T.tenant })).json;
  check("locataire → bail sans coordonnées du propriétaire", l && l.owner && !("phone" in l.owner) && !("email" in l.owner));
}
const adminTenants = (await call("GET", "/tenants?limit=5", { token: T.admin })).json?.data ?? [];
check("agence → voit toujours les téléphones", adminTenants.length === 0 || hasKeyDeep(adminTenants, "phone"));

// --- 5. Entrées malveillantes ---
const inj = await call("GET", `/properties?search=${encodeURIComponent("' OR 1=1;--")}`, { token: T.admin });
check("injection SQL dans la recherche → réponse normale", inj.status === 200);
const big = await call("GET", "/catalog/sales?limit=100000");
check("pagination démesurée refusée (400)", big.status === 400);
const extra = await call("PATCH", "/users/me", { token: T.tenant, body: { role: "SUPER_ADMIN" } });
check("élévation de rôle via le profil refusée (400)", extra.status === 400, JSON.stringify(extra.json?.message));
const me = (await call("GET", "/auth/me", { token: T.tenant })).json;
check("le rôle n'a pas changé", me?.role === "TENANT");
const err = await call("GET", "/catalog/sales?sort=zzz");
check("messages d'erreur en français", JSON.stringify(err.json?.message ?? "").match(/valeur|invalide|obligatoire/) !== null);
const ext = await call("PATCH", "/users/me", { token: T.tenant, body: { avatarUrl: "https://evil.example/x.png" } });
check("avatar externe refusé", ext.status === 400);

// --- 6. Fichiers privés (S-17) : servis seulement par lien signé ; les fichiers publics restent ouverts ---
const withPhoto = adminMaint.find((m) => m.photos?.length);
if (withPhoto) {
  const photo = withPhoto.photos[0];
  check("photo de maintenance sans lien signé → 403", (await call("GET", photo.replace(/^\/api/, ""))).status === 403);
  const signedPhoto = await call("POST", "/files/sign", { token: T.admin, body: { url: photo } });
  check("agence : photo ouverte par lien signé", signedPhoto.status === 201 && (await call("GET", String(signedPhoto.json?.url).replace(/^\/api/, ""))).status === 200);
} else check("photo de maintenance présente pour le contrôle S-17", false, "aucune demande avec photo sur cette base");
const adminAvatar = (await call("GET", "/auth/me", { token: T.admin })).json?.avatarUrl;
if (adminAvatar?.startsWith("/api/files/")) check("fichier public (avatar) ouvert sans signature", (await call("GET", adminAvatar.replace(/^\/api/, ""))).status === 200);

// --- 7. En-têtes et CORS ---
const h = await call("GET", "/catalog/sales?limit=1", { headers: { Origin: "https://evil.example" } });
check("pas d'autorisation CORS pour un site tiers", h.headers.get("access-control-allow-origin") !== "https://evil.example" && h.headers.get("access-control-allow-origin") !== "*");
check("en-tête X-Content-Type-Options", h.headers.get("x-content-type-options") === "nosniff");
check("pas d'en-tête X-Powered-By", !h.headers.get("x-powered-by"));

console.log(`\n${results.length - failures}/${results.length} contrôles réussis.`);
process.exit(failures ? 1 : 0);
