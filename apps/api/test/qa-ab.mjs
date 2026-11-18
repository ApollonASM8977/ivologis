// Checklist 2, point 7 « Prove it » : l'utilisateur A crée un enregistrement, l'utilisateur B essaie de le lire, le
// modifier, le supprimer (et d'y écrire). Chaque tentative doit répondre 403 ou 404.
// Les comptes B (locataire et propriétaire) sont créés par le vrai parcours : fiche par l'agence → code d'invitation → inscription.
// Usage (base de test UNIQUEMENT) : QA_API=http://localhost:3101/api QA_ADMIN=… QA_OWNER=… QA_TENANT=… node test/qa-ab.mjs
const API = process.env.QA_API ?? "http://localhost:3101/api";
if (/onrender\.com|ivologis\.ci/.test(API)) {
  console.error("Refusé : ce test crée des comptes et des données, jamais sur la production.");
  process.exit(2);
}
const T = { admin: process.env.QA_ADMIN, ownerA: process.env.QA_OWNER, tenantA: process.env.QA_TENANT };
for (const [k, v] of Object.entries(T)) if (!v) throw new Error(`Jeton manquant : ${k}`);

const call = async (method, path, tok, body) => {
  const r = await fetch(API + path, { method, headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const must = (res, what) => {
  if (res.status >= 300) throw new Error(`${what} : ${res.status} ${JSON.stringify(res.body?.message)}`);
  return res.body;
};
const suffix = Date.now().toString().slice(-7);
const phone = (n) => `+22501${n}${suffix}`;

/** Compte B créé comme un vrai client : fiche par l'agence, code d'invitation, inscription, connexion. */
async function createUserB(kind) {
  const fullName = `${kind === "tenants" ? "Locataire" : "Propriétaire"} B ${suffix}`;
  const email = `${kind}.b.${suffix}@exemple.ci`;
  const tel = phone(kind === "tenants" ? "1" : "2");
  const profile = must(await call("POST", `/${kind}`, T.admin, { fullName, phone: tel, email }), `fiche ${kind}`);
  const invite = must(await call("POST", `/${kind}/${profile.id}/invite`, T.admin), `invitation ${kind}`);
  const password = `Qa-B-${suffix}-Mot2passe`;
  const reg = await call("POST", "/auth/register", null, { fullName, email, phone: tel, password, role: kind === "tenants" ? "TENANT" : "OWNER", inviteCode: invite.code });
  must(reg, `inscription ${kind}`);
  const login = must(await call("POST", "/auth/login", null, { identifier: email, password }), `connexion ${kind}`);
  return login.accessToken ?? login.token;
}

const results = [];
const expectDenied = async (who, action, method, path, tok, body) => {
  const r = await call(method, path, tok, body);
  results.push({ who, action, method, path, status: r.status, ok: r.status === 403 || r.status === 404 });
};

// 1. A crée ses enregistrements.
const lease = must(await call("GET", "/leases?limit=1", T.tenantA), "bail du locataire A");
const leaseA = (lease.data ?? lease)[0];
const maintenance = must(await call("POST", "/maintenance", T.tenantA, { propertyId: leaseA.propertyId, issueType: "PLOMBERIE", description: "Test A/B : fuite sous l'évier (créée par le locataire A).", priority: "MOYENNE" }), "demande de maintenance du locataire A");
// Un propriétaire ne crée pas de bien lui-même (décision E-13 : l'agence les crée) : on prend un bien qui lui est rattaché.
const ownerProps = must(await call("GET", "/properties?limit=1", T.ownerA), "biens du propriétaire A");
const property = (ownerProps.data ?? ownerProps)[0];

// Contrôle du test lui-même : A lit bien ses propres enregistrements.
const ownRead = [await call("GET", `/maintenance/${maintenance.id}`, T.tenantA), await call("GET", `/properties/${property.id}`, T.ownerA)];

// 2. Comptes B.
const tenantB = await createUserB("tenants");
const ownerB = await createUserB("owners");

// 3. B essaie de lire, modifier, supprimer et écrire.
for (const [who, tok] of [["locataire B", tenantB], ["propriétaire B", ownerB]]) {
  await expectDenied(who, "lire", "GET", `/maintenance/${maintenance.id}`, tok);
  await expectDenied(who, "modifier", "PATCH", `/maintenance/${maintenance.id}`, tok, { status: "RESOLU" });
  await expectDenied(who, "supprimer", "DELETE", `/maintenance/${maintenance.id}`, tok);
  await expectDenied(who, "écrire (commentaire)", "POST", `/maintenance/${maintenance.id}/comments`, tok, { comment: "intrusion" });
  await expectDenied(who, "lire", "GET", `/properties/${property.id}`, tok);
  await expectDenied(who, "modifier", "PATCH", `/properties/${property.id}`, tok, { name: "Bien piraté" });
  await expectDenied(who, "supprimer", "DELETE", `/properties/${property.id}`, tok);
  await expectDenied(who, "lire le bail", "GET", `/leases/${leaseA.id}`, tok);
}


console.log(`Contrôle : A lit ses propres enregistrements → ${ownRead.map((r) => r.status).join(", ")} (attendu 200, 200)`);
console.log("\n| Utilisateur | Action | Requête | Réponse | Résultat |\n|---|---|---|---|---|");
for (const r of results) console.log(`| ${r.who} | ${r.action} | ${r.method} ${r.path.replace(/[0-9a-f-]{36}/, ":id")} | ${r.status} | ${r.ok ? "refusé ✓" : "ACCEPTÉ ✗"} |`);
const failed = results.filter((r) => !r.ok).length + ownRead.filter((r) => r.status !== 200).length;
console.log(`\n${results.length - results.filter((r) => !r.ok).length}/${results.length} tentatives refusées (403/404).`);
process.exit(failed ? 1 : 0);
