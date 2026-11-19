// P1-14 : parcours du catalogue dans un vrai navigateur (build de production + API).
// CI : base Postgres neuve + seed. Local : API sur la base de TEST audit-qa (jamais la production).
// Le test publie un logement vacant (non démo) le temps du parcours, puis remet tout comme avant :
// catalogue → fiche → demande de visite sans compte → suivi par référence et téléphone → fiche en anglais → 404.
// Usage : E2E_WEB=http://localhost:3100 E2E_API=http://localhost:3101/api (QA_ADMIN=<jeton> | SEED_PASSWORD=…) node e2e/parcours-catalogue.mjs
import puppeteer from "puppeteer-core";

const WEB = process.env.E2E_WEB ?? "http://localhost:3100";
const API = process.env.E2E_API ?? "http://localhost:3101/api";
if (/onrender\.com|ivologis\.ci/.test(WEB + API)) {
  console.error("Refusé : ce test modifie des données, jamais sur la production.");
  process.exit(2);
}
const CHROME = process.env.CHROME_PATH ?? (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : "/usr/bin/google-chrome");
const PHONE = "+225 07 11 22 33 44";

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "OK " : "KO "} ${name}${detail ? ` — ${detail}` : ""}`);
};

async function adminToken() {
  if (process.env.QA_ADMIN) return process.env.QA_ADMIN;
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: process.env.E2E_ADMIN_EMAIL ?? "admin@ivologis.ci", password: process.env.SEED_PASSWORD }),
  });
  if (!r.ok) throw new Error(`Connexion admin impossible (${r.status})`);
  return (await r.json()).accessToken;
}
const token = await adminToken();
const api = async (method, path, body) => {
  const r = await fetch(`${API}${path}`, { method, headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body && JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};

const properties = (await api("GET", "/properties?limit=100")).body?.data ?? [];
const listing = properties.find((p) => !p.isDemo && !p.archivedAt && p.status === "VACANT" && Number(p.rentAmount) > 0);
if (!listing) throw new Error("Aucun logement vacant non démo pour le parcours");
const before = { rentListed: listing.rentListed };
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: process.env.CI ? ["--no-sandbox"] : [] });
let reference = null;

try {
  await api("PATCH", `/properties/${listing.id}`, { rentListed: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.evaluateOnNewDocument(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(e.violatedDirective));
  });

  // 1. Le logement publié apparaît dans le catalogue ; on ouvre sa fiche.
  await page.goto(`${WEB}/fr/catalogue/locations`, { waitUntil: "networkidle2" });
  const link = await page.waitForSelector(`a[href="/catalogue/locations/${listing.id}"]`, { timeout: 20000 }).catch(() => null);
  check("catalogue : le logement publié est listé", !!link, listing.name);
  await page.goto(`${WEB}/fr/catalogue/locations/${listing.id}`, { waitUntil: "networkidle2" });
  check("fiche : nom du logement affiché", await page.evaluate((n) => document.body.innerText.includes(n), listing.name));

  // 2. Demande de visite sans compte.
  const ask = await page.waitForFunction(() => [...document.querySelectorAll("button")].find((b) => b.innerText.includes("Demander une visite") && !b.disabled), { timeout: 20000 });
  await ask.asElement().click();
  await page.waitForSelector("#vf-guestName", { timeout: 10000 });
  await page.type("#vf-guestName", "Parcours CI");
  await page.type("#vf-guestPhone", PHONE);
  await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] button[type="submit"]')][0].click());
  await page.waitForFunction(() => document.body.innerText.includes("Référence à conserver"), { timeout: 20000 });
  reference = await page.$eval('[role="dialog"] .font-mono', (e) => e.textContent.trim());
  check("demande de visite envoyée, référence affichée", /^RDV-\d{4}-[0-9A-F]{8}$/.test(reference), reference);

  // 3. Suivi par référence (pré-remplie par le lien) et téléphone.
  await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] a')].find((a) => a.innerText.includes("Suivre ma demande")).click());
  await page.waitForSelector("#track-phone", { timeout: 20000 });
  check("suivi : référence pré-remplie", (await page.$eval("#track-reference", (e) => e.value)) === reference);
  await page.type("#track-phone", PHONE);
  await page.evaluate(() => document.querySelector("#track-phone").form.requestSubmit());
  await page.waitForFunction(() => document.querySelector("[data-track-result]")?.innerText.trim().length > 0, { timeout: 20000 });
  const status = await page.$eval("[data-track-result]", (e) => e.innerText.replace(/\s+/g, " ").trim());
  check("suivi : statut « En attente » sans compte", status.includes("En attente"), status.slice(0, 80));
  check("aucune violation CSP (FR)", (await page.evaluate(() => window.__csp)).length === 0);

  // 4. La même fiche en anglais.
  await page.goto(`${WEB}/en/catalogue/locations/${listing.id}`, { waitUntil: "networkidle2" });
  const en = await page.evaluate(() => ({ lang: document.documentElement.lang, button: [...document.querySelectorAll("button")].some((b) => b.innerText.includes("Request a viewing")) }));
  check("fiche en anglais (lang=en, bouton traduit)", en.lang === "en" && en.button, JSON.stringify(en));

  // 5. Fiche inconnue : vraie 404.
  const missing = await page.goto(`${WEB}/fr/catalogue/locations/00000000-0000-4000-8000-000000000000`, { waitUntil: "domcontentloaded" });
  check("fiche inconnue : 404", missing.status() === 404, String(missing.status()));
} finally {
  await browser.close();
  // Remise en état : publication comme avant, demande du test refusée (la boîte de réception reste propre).
  await api("PATCH", `/properties/${listing.id}`, before);
  if (reference) {
    const requests = (await api("GET", "/visit-requests")).body ?? [];
    const mine = requests.find((r) => r.reference === reference);
    if (mine) await api("PATCH", `/visit-requests/${mine.id}/refuse`);
  }
}

console.log(failures ? `\n${failures} contrôle(s) en échec.` : "\nParcours du catalogue réussi.");
process.exit(failures ? 1 : 0);
