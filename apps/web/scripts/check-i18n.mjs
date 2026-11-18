// Garde-fou du bilingue (D-14) : échoue si un texte français n'a pas de traduction anglaise, ou s'il s'affiche sans t().
// Usage : node scripts/check-i18n.mjs [--json fichier]   (écrit les clés manquantes par zone dans le JSON)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = path.resolve(ROOT, "../../packages/shared/src");

// Textes rangés dans des objets `Messages` typés (fr/en) : vérifiés par le compilateur, pas ici.
// L'image de partage reste en français : les robots des réseaux sociaux n'envoient pas de cookie de langue.
const TYPED = [/^messages\//, /^app\/(global-error|manifest|opengraph-image|icon|apple-icon)\./, /^app\/\[lang\]\/(not-found|offline\/page)\.tsx$/, /^components\/marketing\//, /^app\/\[lang\]\/\(marketing\)\/(page|layout|securite|verification|mentions-legales|confidentialite|conditions-generales)\b/, /^app\/\[lang\]\/layout\.tsx$/, /^components\/(language-switcher|audience)\.tsx$/, /^lib\//, /^scripts\//];
const ACCENT = /[àâäçéèêëîïôöùûüÿœæÀÂÇÉÈÊËÎÏÔÙÛÜŒ«»’…]/;

function isFrench(s, relaxed) {
  const v = s.trim();
  if (!v || v.length < 2) return false;
  if (/^(\/|https?:|#|data:|mailto:|tel:)/.test(v) || /^use (client|server)$/.test(v) || /rgba?\(|\d+px/.test(v)) return false;
  if (/^[A-Z0-9_]+$/.test(v)) return false;
  if (/^[a-z0-9\-_.:\/\[\]%!@#()=,{}$]+$/i.test(v) && !ACCENT.test(v) && !/^[A-ZÉ][a-zé]{2,}$/.test(v)) return false;
  if (/-/.test(v) && /^([a-z0-9\-_:\/\[\].%!]+\s+)+[a-z0-9\-_:\/\[\].%!]+$/.test(v)) return false;
  if (ACCENT.test(v)) return true;
  if (/[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(v) && /[a-z]/.test(v)) return true;
  return relaxed && /^[A-ZÉ][a-zé]{2,}[.!?]?$/.test(v);
}

function areaOf(rel, src) {
  const m = src.match(/from "@\/lib\/t-(\w+)"/);
  if (m) return m[1];
  if (rel.startsWith("components/catalog/") || rel.includes("/catalogue/")) return "catalog";
  if (rel.includes("/(auth)/") || rel.includes("/offline/") || rel === "components/auth-layout.tsx") return "auth";
  if (rel.startsWith("components/ui/")) return "ui";
  return "spaces";
}

async function loadDict(name) {
  const file = path.join(ROOT, "messages/en", `${name}.ts`);
  const src = fs.readFileSync(file, "utf8");
  // Le fichier est un simple objet littéral : on l'évalue après avoir retiré les annotations TypeScript.
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace(/^import .*$/gm, "");
  const mod = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
  return Object.values(mod)[0];
}
const DICTS = {};
for (const n of ["labels", "catalog", "spaces", "auth", "ui"]) DICTS[n] = await loadDict(n);
const lookup = { catalog: ["labels", "catalog"], spaces: ["labels", "spaces"], auth: ["auth"], ui: ["labels", "ui"] };
const has = (area, key) => lookup[area].some((d) => Object.prototype.hasOwnProperty.call(DICTS[d], key));

const missing = { labels: new Set(), catalog: new Set(), spaces: new Set(), auth: new Set(), ui: new Set() };
const leftovers = [];
const suspicious = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : /\.(tsx?|mts)$/.test(d.name) ? [path.join(dir, d.name)] : []));
}
const files = [...walk(path.join(ROOT, "app")), ...walk(path.join(ROOT, "components")), ...walk(path.join(ROOT, "lib"))];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (TYPED.some((r) => r.test(rel))) continue;
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const area = areaOf(rel, src);
  const tNames = new Set([...src.matchAll(/import \{\s*t(?:\s+as\s+(\w+))?\s*\} from "@\/lib\/t-\w+"/g)].map((m) => m[1] ?? "t"));
  const at = (n) => `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1}`;
  const inTCall = (n) => {
    for (let p = n.parent; p; p = p.parent) {
      if (ts.isCallExpression(p) && ts.isIdentifier(p.expression) && (tNames.has(p.expression.text) || ["clsx", "cn"].includes(p.expression.text))) return true;
      if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || (ts.isPropertyAssignment(p) && p.name === n)) return true;
    }
    return false;
  };
  const inFunction = (n) => { for (let p = n.parent; p; p = p.parent) if (ts.isFunctionLike(p)) return true; return false; };

  (function visit(node) {
    // Clés statiques t("…") : traduction obligatoire.
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && tNames.has(node.expression.text)) {
      const a = node.arguments[0];
      if (a && (ts.isStringLiteral(a) || ts.isNoSubstitutionTemplateLiteral(a))) {
        if (!has(area, a.text)) missing[area].add(a.text);
        if (!/\s/.test(a.text) && /[.\/{}]/.test(a.text) && !/^\{\d+\}/.test(a.text)) suspicious.push(`${at(a)} clé qui ressemble à du code : ${a.text}`);
      }
    }
    if (ts.isJsxText(node) && /[A-Za-zÀ-ÿ]{2,}/.test(node.text) && isFrench(node.text.replace(/\s+/g, " "), true)) leftovers.push(`${at(node)} texte JSX : ${node.text.trim().slice(0, 70)}`);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const p = node.parent;
      const attr = ts.isJsxAttribute(p) ? p.name.getText(sf) : null;
      const skipAttr = attr && /^(className|href|src|id|htmlFor|type|name|key|role|rel|target|variant|size|color|autoComplete|inputMode|accept|value|defaultValue|pattern|lang|style|d|viewBox|sizes|data-.*|aria-(hidden|live|controls|describedby|labelledby))$/.test(attr);
      // « // i18n-ok » sur la ligne ou celle du dessus : texte volontairement affiché ailleurs via t() (ex. clé de regroupement).
      const lineNo = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line;
      const lines = src.split(/\r?\n/);
      const okLine = /\/\/ i18n-ok/.test((lines[lineNo - 1] ?? "") + (lines[lineNo] ?? ""));
      const isCompare = ts.isBinaryExpression(p) || ts.isCaseClause(p) || (ts.isElementAccessExpression(p) && p.argumentExpression === node);
      if (!skipAttr && !okLine && !isCompare && !inTCall(node) && isFrench(node.text, !!attr)) {
        if (!inFunction(node)) {
          // Constante de module (listes de libellés) : affichée via t(x.label) → doit être au dictionnaire.
          if (!has(area, node.text)) missing[area].add(node.text);
        } else leftovers.push(`${at(node)} chaîne : ${node.text.slice(0, 70)}`);
      }
    }
    if (ts.isTemplateExpression(node) && inFunction(node) && !inTCall(node)) {
      const txt = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(" ");
      if (isFrench(txt, false) && !/^[\s\-a-z0-9:\/\[\].%!?=&#]*$/.test(txt)) leftovers.push(`${at(node)} gabarit : ${node.getText(sf).slice(0, 70)}`);
    }
    ts.forEachChild(node, visit);
  })(sf);
}

// Libellés partagés (@ivologis/shared) : toutes les valeurs doivent être traduites.
for (const f of ["labels.ts", "constants.ts"]) {
  const src = fs.readFileSync(path.join(SHARED, f), "utf8");
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true);
  (function visit(node) {
    if (ts.isVariableDeclaration(node) && /_LABELS$/.test(node.name.getText(sf)) && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      for (const prop of node.initializer.properties) if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer) && !Object.prototype.hasOwnProperty.call(DICTS.labels, prop.initializer.text)) missing.labels.add(prop.initializer.text);
    }
    ts.forEachChild(node, visit);
  })(sf);
}

const total = Object.values(missing).reduce((s, set) => s + set.size, 0);
const jsonOut = process.argv.indexOf("--json");
if (jsonOut > 0) fs.writeFileSync(process.argv[jsonOut + 1], JSON.stringify(Object.fromEntries(Object.entries(missing).map(([k, v]) => [k, [...v].sort()])), null, 1));
for (const [area, set] of Object.entries(missing)) if (set.size) console.log(`Traductions manquantes (${area}) : ${set.size}`);
if (leftovers.length) console.log(`\nTextes français affichés sans t() : ${leftovers.length}\n` + leftovers.join("\n"));
if (suspicious.length) console.log(`\nÀ vérifier :\n` + suspicious.join("\n"));
if (total || leftovers.length) {
  console.log(`\n✗ Bilingue incomplet : ${total} traduction(s) manquante(s), ${leftovers.length} texte(s) hors t().`);
  process.exit(1);
}
console.log("✓ Bilingue complet : chaque texte affiché a sa traduction anglaise.");
