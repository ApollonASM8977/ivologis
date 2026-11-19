// P1-09 vérification foncière documentée : l'agence ne certifie un titre qu'avec la copie du document foncier archivée
// (date, vérificateur, pièce gardés) ; supprimer la pièce retire la vérification ; l'annonce publique n'expose que la date.
// Base de TEST uniquement. Le test ne supprime que le document qu'il dépose lui-même (libellé QA_LABEL) et remet
// la vérification comme avant (si le bien était vérifié, il le reste, sur la copie de test).
// Usage : QA_API=http://localhost:3101/api QA_ADMIN=<jeton super admin> QA_OWNER=<jeton propriétaire> node test/qa-foncier.mjs
const API = process.env.QA_API ?? "http://localhost:3101/api";
if (/onrender\.com|ivologis\.ci/.test(API)) {
  console.error("Refusé : ce test modifie des données, jamais sur la production.");
  process.exit(2);
}
const T = { admin: process.env.QA_ADMIN, owner: process.env.QA_OWNER };
for (const [k, v] of Object.entries(T)) if (!v) throw new Error(`Jeton manquant : ${k}`);
const QA_LABEL = "QA foncier — copie de test";

const call = async (method, path, tok, body) => {
  const headers = tok ? { authorization: `Bearer ${tok}` } : {};
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["content-type"] = "application/json";
  const r = await fetch(API + path, { method, headers, body: body === undefined ? undefined : isForm ? body : JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK " : "KO "} ${name}${detail ? ` — ${detail}` : ""}`);
};
const docs = async (id) => (await call("GET", `/properties/${id}/sale-documents`, T.admin)).body ?? [];
const uploadLandDocument = async (id) => {
  const form = new FormData();
  form.append("type", "DOCUMENT_FONCIER");
  form.append("label", QA_LABEL);
  form.append("file", new Blob(["%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"], { type: "application/pdf" }), "titre-test.pdf");
  return call("POST", `/properties/${id}/sale-documents`, T.admin, form);
};
const property = async (id) => (await call("GET", `/properties/${id}`, T.admin)).body;

// Un bien en vente, non vendu, avec un type de titre et sans pièce foncière autre que celle du test.
const sales = (await call("GET", "/sales", T.admin)).body ?? [];
let prop;
for (const s of sales.filter((p) => p.saleStatus !== "VENDU" && !p.archivedAt && p.landTitleType)) {
  if (!(await docs(s.id)).some((d) => d.type === "DOCUMENT_FONCIER" && d.label !== QA_LABEL)) { prop = s; break; }
}
if (!prop) throw new Error("Aucun bien en vente utilisable pour le test");
const snapshot = await property(prop.id);
const admin = (await call("GET", "/auth/me", T.admin)).body;
console.log(`Bien testé : ${snapshot.name} (vérifié avant : ${snapshot.landTitleVerified})`);
for (const d of (await docs(prop.id)).filter((d) => d.label === QA_LABEL)) await call("DELETE", `/sale-documents/${d.id}`, T.admin);

try {
  const legacy = await call("PATCH", `/properties/${prop.id}/sale`, T.admin, { forSale: true, salePrice: Number(snapshot.salePrice), landTitleType: snapshot.landTitleType, landTitleVerified: true });
  check("ancienne voie (champ landTitleVerified dans la mise en vente) refusée", legacy.status === 400, `reçu ${legacy.status}`);
  check("propriétaire : vérification refusée (403)", (await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.owner, { verified: true })).status === 403);
  check("champ inconnu refusé", (await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.admin, { verified: true, landTitleVerifiedBy: "x" })).status === 400);

  const off = await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.admin, { verified: false });
  check("retrait de la vérification", off.status === 200 && off.body.landTitleVerified === false && !off.body.landTitleVerifiedAt && !off.body.landTitleDocumentId);
  check("non vérifié : absent du catalogue public (404)", (await call("GET", `/catalog/sales/${prop.id}`)).status === 404);
  const queue = (await call("GET", "/properties?toReview=true&limit=100", T.admin)).body;
  check("non vérifié : dans la file « À vérifier »", queue.data.some((p) => p.id === prop.id));

  const noDoc = await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.admin, { verified: true });
  check("vérification sans pièce foncière archivée refusée (400)", noDoc.status === 400, noDoc.body?.message);

  const up = await uploadLandDocument(prop.id);
  check("copie du document foncier archivée", up.status === 201 && up.body?.type === "DOCUMENT_FONCIER", `reçu ${up.status}`);
  const on = await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.admin, { verified: true });
  check("vérification avec la pièce : date, vérificateur et pièce gardés",
    on.status === 200 && on.body.landTitleVerified === true && !!on.body.landTitleVerifiedAt && on.body.landTitleVerifiedBy === admin.fullName && on.body.landTitleDocumentId === up.body.id);

  const pub = await call("GET", `/catalog/sales/${prop.id}`);
  check("annonce publique : date de vérification exposée", pub.status === 200 && !!pub.body.landTitleVerifiedAt, `reçu ${pub.status}`);
  check("annonce publique : ni vérificateur ni pièce", pub.body && !("landTitleVerifiedBy" in pub.body) && !("landTitleDocumentId" in pub.body));

  if (snapshot.saleStatus === "DISPONIBLE") {
    const same = await call("PATCH", `/properties/${prop.id}/sale`, T.admin, { forSale: true, salePrice: Number(snapshot.salePrice), saleCommissionRate: snapshot.saleCommissionRate == null ? undefined : Number(snapshot.saleCommissionRate), landTitleType: snapshot.landTitleType });
    check("agence modifie l'annonce sans changer de titre : vérification gardée", same.status === 200 && same.body.landTitleVerified === true, `reçu ${same.status}`);
  }

  const del = await call("DELETE", `/sale-documents/${up.body.id}`, T.admin);
  const afterDelete = await property(prop.id);
  check("pièce supprimée : vérification retirée", del.status === 200 && afterDelete.landTitleVerified === false && !afterDelete.landTitleDocumentId && !afterDelete.landTitleVerifiedAt);
  check("pièce supprimée : annonce retirée du catalogue (404)", (await call("GET", `/catalog/sales/${prop.id}`)).status === 404);
} finally {
  if (snapshot.landTitleVerified) {
    const again = await uploadLandDocument(prop.id);
    if (again.status === 201) await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.admin, { verified: true });
  } else {
    await call("PATCH", `/properties/${prop.id}/land-title-verification`, T.admin, { verified: false });
  }
}

const restored = await property(prop.id);
check("vérification remise comme avant", restored.landTitleVerified === snapshot.landTitleVerified && restored.saleStatus === snapshot.saleStatus);
check("catalogue public comme avant", ((await call("GET", `/catalog/sales/${prop.id}`)).status === 200) === snapshot.landTitleVerified);

console.log(failures ? `\n${failures} contrôle(s) en échec.` : "\nTous les contrôles réussis.");
process.exit(failures ? 1 : 0);
