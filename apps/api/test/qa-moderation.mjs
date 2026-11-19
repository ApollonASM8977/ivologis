// P1-17 « À vérifier » : une modification par le propriétaire retire ses annonces, met le bien dans la file de l'agence
// et prévient l'agence ; un passage de l'agence l'en sort. Base de TEST uniquement : modifie puis restaure les données
// (permission accordée puis retirée, publication remise comme avant).
// Usage : QA_API=http://localhost:3101/api QA_ADMIN=<jeton super admin> QA_OWNER=<jeton propriétaire> node test/qa-moderation.mjs
const API = process.env.QA_API ?? "http://localhost:3101/api";
if (/onrender\.com|ivologis\.ci/.test(API)) {
  console.error("Refusé : ce test modifie des données, jamais sur la production.");
  process.exit(2);
}
const T = { admin: process.env.QA_ADMIN, owner: process.env.QA_OWNER };
for (const [k, v] of Object.entries(T)) if (!v) throw new Error(`Jeton manquant : ${k}`);

const call = async (method, path, tok, body) => {
  const r = await fetch(API + path, { method, headers: { "content-type": "application/json", authorization: `Bearer ${tok}` }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK " : "KO "} ${name}${detail ? ` — ${detail}` : ""}`);
};

const ownerMe = (await call("GET", "/auth/me", T.owner)).body;
const permissionsBefore = ownerMe.permissions ?? [];
const prop = ((await call("GET", "/properties?limit=1", T.owner)).body?.data ?? [])[0];
if (!prop) throw new Error("Aucun bien pour le propriétaire de test");
const snapshot = (await call("GET", `/properties/${prop.id}`, T.admin)).body;
const ownerEdit = { description: snapshot.description || "Description" };

try {
  check("propriétaire sans permission : modification refusée (403)", (await call("PATCH", `/properties/${prop.id}`, T.owner, ownerEdit)).status === 403);
  await call("PATCH", `/users/${ownerMe.id}/permissions`, T.admin, { permissions: [...new Set([...permissionsBefore, "properties.manage"])] });

  const edit = await call("PATCH", `/properties/${prop.id}`, T.owner, ownerEdit);
  check("propriétaire avec permission : modification acceptée", edit.status === 200, `reçu ${edit.status}`);
  const after = (await call("GET", `/properties/${prop.id}`, T.admin)).body;
  check("annonces retirées (location et courte durée)", after.rentListed === false && after.shortStayApproved === false);
  check("bien marqué « à vérifier »", !!after.reviewRequestedAt);

  const queue = (await call("GET", "/properties?toReview=true&limit=100", T.admin)).body;
  check("présent dans la file « À vérifier » de l'agence", queue.data.some((p) => p.id === prop.id), `${queue.total} bien(s) en file`);
  const dashboard = (await call("GET", "/reports/dashboard", T.admin)).body;
  check("compteur du tableau de bord = taille de la file", dashboard.toReviewCount === queue.total, `${dashboard.toReviewCount} / ${queue.total}`);
  const notifications = (await call("GET", "/notifications/me?limit=10", T.admin)).body;
  check("agence notifiée", JSON.stringify(notifications).includes(snapshot.name));
} finally {
  // Passage de l'agence : republication comme avant, puis permission retirée.
  await call("PATCH", `/properties/${prop.id}`, T.admin, { rentListed: snapshot.rentListed, shortStayApproved: snapshot.shortStayApproved });
  await call("PATCH", `/users/${ownerMe.id}/permissions`, T.admin, { permissions: permissionsBefore });
}

const restored = (await call("GET", `/properties/${prop.id}`, T.admin)).body;
check("après passage de l'agence : sorti de la file, publication comme avant",
  !restored.reviewRequestedAt && restored.rentListed === snapshot.rentListed && restored.shortStayApproved === snapshot.shortStayApproved);
check("permission du propriétaire remise comme avant", ((await call("GET", "/auth/me", T.owner)).body.permissions ?? []).length === permissionsBefore.length);
const queueAfter = (await call("GET", "/properties?toReview=true&limit=100", T.admin)).body;
check("plus dans la file", !queueAfter.data.some((p) => p.id === prop.id));

console.log(failures ? `\n${failures} contrôle(s) en échec.` : "\nTous les contrôles réussis.");
process.exit(failures ? 1 : 0);
