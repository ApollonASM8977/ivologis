const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const { authenticator } = require("otplib");

const API = process.env.API_URL ?? "http://localhost:3001";
const BASE = `${API}/api`;
const ADMIN_TOTP_SECRET = process.env.TEST_ADMIN_TOTP_SECRET;
let reachable = false;
const ctx = {};

async function call(path, { method = "GET", token, body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data, headers: res.headers };
}

async function login(identifier, password, code) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await call("/auth/login", { method: "POST", body: code ? { identifier, password, code } : { identifier, password } });
    if (r.status === 429 && attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 61_000));
      continue;
    }
    return { token: r.data?.accessToken ?? null, data: r.data };
  }
  return { token: null, data: null };
}

before(async () => {
  try {
    const r = await fetch(`${BASE}/settings`);
    reachable = r.status === 401;
  } catch {
    reachable = false;
  }
  if (!reachable) return;
  ctx.tenant = (await login("yao.patrick@ivologis.ci", "Locataire@2026")).token;
  ctx.owner = (await login("marc.koffi@ivologis.ci", "Proprio@2026")).token;
  if (ADMIN_TOTP_SECRET) {
    const first = await login("qa-admin@ivologis.ci", "QaAdmin@2026");
    ctx.admin = first.data?.requires2fa
      ? (await login("qa-admin@ivologis.ci", "QaAdmin@2026", authenticator.generate(ADMIN_TOTP_SECRET))).token
      : first.token;
    const leases = await call("/leases?limit=50", { token: ctx.admin });
    ctx.leases = leases.data?.data ?? [];
  }
});

function requireApi(t) {
  if (!reachable) t.skip(`API injoignable sur ${API} (définir API_URL et lancer l'API)`);
  return reachable;
}

function requireAdmin(t) {
  if (!requireApi(t)) return false;
  if (!ctx.admin) t.skip("compte QA administrateur indisponible (définir TEST_ADMIN_TOTP_SECRET)");
  return !!ctx.admin;
}

test("authentification : identifiants invalides et routes protégées", async (t) => {
  if (!requireApi(t)) return;
  const bad = await call("/auth/login", { method: "POST", body: { identifier: "yao.patrick@ivologis.ci", password: "faux" } });
  assert.equal(bad.status, 401);
  assert.equal((await call("/leases")).status, 401);
});

test("administrateur : 2FA exigée, code correct requis", async (t) => {
  if (!requireApi(t)) return;
  if (!ADMIN_TOTP_SECRET) return t.skip("TEST_ADMIN_TOTP_SECRET non défini");
  const sans = await login("qa-admin@ivologis.ci", "QaAdmin@2026");
  assert.equal(sans.data?.requires2fa, true, "code demandé");
  assert.equal(sans.token, null, "aucun jeton sans code");
  const faux = await call("/auth/login", { method: "POST", body: { identifier: "qa-admin@ivologis.ci", password: "QaAdmin@2026", code: "000000" } });
  assert.equal(faux.status, 401, "mauvais code refusé");
  assert.ok(ctx.admin, "connexion avec code valide");
});

test("contrôle d'accès par rôle", async (t) => {
  if (!requireApi(t)) return;
  assert.equal((await call("/users", { token: ctx.tenant })).status, 403, "locataire ne liste pas les utilisateurs");
  assert.equal((await call("/audit-logs", { token: ctx.owner })).status, 403, "propriétaire ne lit pas le journal");
  assert.equal((await call("/payments/simulate", { method: "POST", token: ctx.tenant, body: {} })).status, 403, "locataire ne simule pas de paiement");
  assert.equal((await call("/contact-requests", { token: ctx.tenant })).status, 403, "locataire ne lit pas les demandes");
  assert.equal((await call("/search?q=ab", { token: ctx.owner })).status, 403, "propriétaire n'accède pas à la recherche interne");
  assert.equal((await call("/leases/revisions/due", { token: ctx.tenant })).status, 403, "locataire ne voit pas les révisions");
});

test("isolation des données entre comptes", async (t) => {
  if (!requireAdmin(t)) return;
  const own = ctx.leases.find((l) => l.tenant?.fullName === "Yao Patrick");
  const other = ctx.leases.find((l) => l.tenant?.fullName && l.tenant.fullName !== "Yao Patrick");
  if (!own || !other) return t.skip("jeu de données insuffisant");
  assert.equal((await call(`/leases/${own.id}`, { token: ctx.tenant })).status, 200, "locataire voit son bail");
  assert.equal((await call(`/leases/${other.id}`, { token: ctx.tenant })).status, 403, "locataire ne voit pas un autre bail");
  assert.equal((await call(`/leases/${other.id}/inspections`, { token: ctx.tenant })).status, 403, "locataire ne voit pas les états des lieux d'autrui");
  const mine = await call("/leases?limit=50", { token: ctx.owner });
  assert.ok((mine.data?.data ?? []).every((l) => l.owner?.fullName === "Marc Koffi"), "propriétaire ne voit que ses contrats");
  const balance = await call(`/owners/${other.ownerId}/balance`, { token: ctx.tenant });
  assert.equal(balance.status, 403, "locataire ne voit pas le solde d'un propriétaire");
});

test("documents : signature obligatoire et contrôle d'accès", async (t) => {
  if (!requireAdmin(t)) return;
  const doc = ctx.leases.find((l) => l.documentUrl);
  if (!doc) return t.skip("aucun document généré");
  const unsigned = await fetch(`${API}${doc.documentUrl}`);
  assert.equal(unsigned.status, 403, "lien brut sans signature refusé");
  const signed = await call("/files/sign", { method: "POST", token: ctx.admin, body: { url: doc.documentUrl } });
  assert.equal(signed.status, 201);
  const ok = await fetch(`${API}${signed.data.url}`);
  assert.equal(ok.status, 200, "lien signé accepté");
  assert.equal(ok.headers.get("x-content-type-options"), "nosniff");
  const badSig = await fetch(`${API}${signed.data.url.replace(/sig=./, "sig=0")}`);
  assert.equal(badSig.status, 403, "signature altérée refusée");
  assert.equal((await call("/files/sign", { method: "POST", body: { url: doc.documentUrl } })).status, 401, "signature sans connexion refusée");
  assert.equal((await call("/files/sign", { method: "POST", token: ctx.admin, body: { url: "/api/files/pas-un-uuid" } })).status, 400, "chemin invalide refusé");
});

test("états des lieux, dépôt et révision : validation côté serveur (aucune écriture)", async (t) => {
  if (!requireAdmin(t)) return;
  const lease = ctx.leases[0];
  if (!lease) return t.skip("aucun bail");
  const badRoom = await call(`/leases/${lease.id}/inspections`, {
    method: "POST",
    token: ctx.admin,
    body: { type: "ENTREE", inspectionDate: "2026-01-01", rooms: [{ name: "Salon", condition: "PARFAIT" }] },
  });
  assert.equal(badRoom.status, 400, "état inconnu refusé");
  const badDeposit = await call(`/leases/${lease.id}/deposit-settlement`, { method: "POST", token: ctx.admin, body: { deductions: [{ label: "x", amount: -5 }] } });
  assert.equal(badDeposit.status, 400, "retenue négative refusée");
  const badRevision = await call(`/leases/${lease.id}/revision`, { method: "POST", token: ctx.admin, body: { newRent: 0 } });
  assert.equal(badRevision.status, 400, "loyer nul refusé");
  const due = await call("/leases/revisions/due", { token: ctx.admin });
  assert.equal(due.status, 200);
  assert.ok(Array.isArray(due.data));
});

test("versements propriétaires : solde calculé et lecture scopée", async (t) => {
  if (!requireApi(t)) return;
  const me = await call("/owners/me", { token: ctx.owner });
  const balance = await call(`/owners/${me.data.id}/balance`, { token: ctx.owner });
  assert.equal(balance.status, 200);
  for (const key of ["gross", "commission", "maintenanceCosts", "paidOut", "balanceDue"]) {
    assert.equal(typeof balance.data[key], "number", `champ ${key}`);
  }
  assert.equal(balance.data.balanceDue, balance.data.gross - balance.data.commission - balance.data.maintenanceCosts - balance.data.paidOut);
  const payoutWrite = await call(`/owners/${me.data.id}/payouts`, { method: "POST", token: ctx.owner, body: { amount: 1000, method: "CASH" } });
  assert.equal(payoutWrite.status, 403, "propriétaire ne peut pas enregistrer un versement");
});

test("demandes locataire : validation et permissions", async (t) => {
  if (!requireApi(t)) return;
  const short = await call("/tenant-requests", { method: "POST", token: ctx.tenant, body: { type: "RESILIATION", message: "court" } });
  assert.equal(short.status, 400, "message trop court refusé");
  const asOwner = await call("/tenant-requests", { method: "POST", token: ctx.owner, body: { type: "AUTRE", message: "Une demande valide ici." } });
  assert.equal(asOwner.status, 403, "propriétaire ne crée pas de demande locataire");
  const list = await call("/tenant-requests", { token: ctx.tenant });
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.data));
});

test("sessions : liste et fermeture par appareil", async (t) => {
  if (!requireApi(t)) return;
  const sessions = await call("/auth/sessions", { token: ctx.tenant });
  assert.equal(sessions.status, 200);
  assert.ok(sessions.data.some((s) => s.current === true), "la session courante est identifiée");
  const forged = await call("/auth/sessions/00000000-0000-0000-0000-000000000000", { method: "DELETE", token: ctx.tenant });
  assert.equal(forged.status, 400, "session inconnue refusée");
});

test("démo : validation côté serveur", async (t) => {
  if (!requireApi(t)) return;
  const r = await call("/contact-requests", { method: "POST", body: { fullName: "A", email: "x", message: "court" } });
  assert.equal(r.status, 400);
  assert.ok(Array.isArray(r.data.message) && r.data.message.length >= 3);
});

test("en-têtes et CORS", async (t) => {
  if (!requireApi(t)) return;
  const r = await fetch(`${BASE}/settings`);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.ok(r.headers.get("x-frame-options") || r.headers.get("content-security-policy"), "protection contre l'intégration (frame)");
  const evil = await fetch(`${BASE}/auth/login`, { method: "OPTIONS", headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" } });
  assert.equal(evil.headers.get("access-control-allow-origin"), null, "origine étrangère non autorisée");
});

test("session : la déconnexion globale invalide les jetons existants", async (t) => {
  if (!requireApi(t)) return;
  const token = (await login("koffi.serge@ivologis.ci", "Locataire@2026")).token;
  if (!token) return t.skip("compte locataire de test indisponible");
  assert.equal((await call("/auth/me", { token })).status, 200);
  await call("/auth/logout-all", { method: "POST", token });
  assert.equal((await call("/auth/me", { token })).status, 401, "jeton révoqué");
});

test("import de locataires : permissions et bornes", async (t) => {
  if (!requireApi(t)) return;
  assert.equal((await call("/tenants/import", { method: "POST", token: ctx.tenant, body: { rows: [{ fullName: "Test", phone: "+2250700000000" }] } })).status, 403, "locataire n'importe pas");
  if (!requireAdmin(t)) return;
  assert.equal((await call("/tenants/import", { method: "POST", token: ctx.admin, body: { rows: [] } })).status, 400, "liste vide refusée");
});
