const { test, before } = require("node:test");
const assert = require("node:assert/strict");

const API = process.env.API_URL ?? "http://localhost:3001";
const BASE = `${API}/api`;
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

async function login(identifier, password) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await call("/auth/login", { method: "POST", body: { identifier, password } });
    if (r.status === 429 && attempt === 0) {
      await new Promise((resolve) => setTimeout(resolve, 61_000));
      continue;
    }
    return r.data?.accessToken ?? null;
  }
  return null;
}

before(async () => {
  try {
    const r = await fetch(`${BASE}/settings`);
    reachable = r.status === 401;
  } catch {
    reachable = false;
  }
  if (!reachable) return;
  ctx.admin = await login("admin@ivologis.ci", "Ivologis@2026");
  ctx.tenant = await login("yao.patrick@ivologis.ci", "Locataire@2026");
  ctx.owner = await login("marc.koffi@ivologis.ci", "Proprio@2026");
  const leases = await call("/leases?limit=50", { token: ctx.admin });
  ctx.leases = leases.data?.data ?? [];
});

function requireApi(t) {
  if (!reachable) t.skip(`API injoignable sur ${API} (définir API_URL et lancer l'API)`);
  return reachable;
}

test("authentification : identifiants valides, invalides et routes protégées", async (t) => {
  if (!requireApi(t)) return;
  assert.ok(ctx.admin, "connexion administrateur");
  const bad = await call("/auth/login", { method: "POST", body: { identifier: "admin@ivologis.ci", password: "faux" } });
  assert.equal(bad.status, 401);
  const anon = await call("/leases");
  assert.equal(anon.status, 401);
});

test("contrôle d'accès par rôle", async (t) => {
  if (!requireApi(t)) return;
  assert.equal((await call("/users", { token: ctx.tenant })).status, 403, "locataire ne liste pas les utilisateurs");
  assert.equal((await call("/audit-logs", { token: ctx.owner })).status, 403, "propriétaire ne lit pas le journal");
  assert.equal((await call("/payments/simulate", { method: "POST", token: ctx.tenant, body: {} })).status, 403, "locataire ne simule pas de paiement");
  assert.equal((await call("/contact-requests", { token: ctx.tenant })).status, 403, "locataire ne lit pas les demandes");
});

test("isolation des données entre comptes", async (t) => {
  if (!requireApi(t)) return;
  const own = ctx.leases.find((l) => l.tenant?.fullName === "Yao Patrick");
  const other = ctx.leases.find((l) => l.tenant?.fullName && l.tenant.fullName !== "Yao Patrick");
  if (!own || !other) return t.skip("jeu de données insuffisant");
  assert.equal((await call(`/leases/${own.id}`, { token: ctx.tenant })).status, 200, "locataire voit son bail");
  assert.equal((await call(`/leases/${other.id}`, { token: ctx.tenant })).status, 403, "locataire ne voit pas un autre bail");
  const mine = await call("/leases?limit=50", { token: ctx.owner });
  assert.ok((mine.data?.data ?? []).every((l) => l.owner?.fullName === "Marc Koffi"), "propriétaire ne voit que ses contrats");
});

test("documents : signature obligatoire et contrôle d'accès", async (t) => {
  if (!requireApi(t)) return;
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
  const token = await login("agent@ivologis.ci", "Agent@2026");
  if (!token) return t.skip("compte agent indisponible");
  assert.equal((await call("/auth/me", { token })).status, 200);
  await call("/auth/logout-all", { method: "POST", token });
  assert.equal((await call("/auth/me", { token })).status, 401, "jeton révoqué");
});
