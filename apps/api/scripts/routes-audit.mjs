// Checklist 2, point 2 (« Ownership ») : inventaire de toutes les routes de l'API, des rôles admis et du contrôle
// d'appartenance de la ressource. Signale toute route qui lit un identifiant de personne (userId, ownerId, tenantId)
// dans la requête. Usage : node scripts/routes-audit.mjs > ../../docs/audit/15_ROUTES.md
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".controller.ts") ? [path.join(d, e.name)] : []));

const OWNERSHIP = [
  [/assertOwnsResource|assertOwnsTenantResource/, "contrôle d'appartenance (scope.util)"],
  [/user\.ownerId|user\.tenantId|ownerId: user|tenantId: user|user\.id\b/, "périmètre limité à l'utilisateur connecté"],
  [/scopeFor|ownerScope|tenantScope|forUser|ForUser/, "requête filtrée sur l'utilisateur"],
  [/canAccess|ForbiddenException|assertCan\w+\(|scope\w*\(\w+, user\)|this\.scope\w+\(/, "refus explicite si autre propriétaire"],
  [/Service\.\w+\([^)]*\buser\b[^)]*\)/, "périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope)"],
];
// Vérifiés à la main (le contrôle est ailleurs que dans le contrôleur, ou la route ne touche aucune ressource existante).
const VERIFIED = {
  "POST /api/maintenance/photos": "envoi d'un nouveau fichier, aucune ressource existante (rattaché ensuite à la demande du locataire)",
  "POST /api/tenant-requests/attachment": "envoi d'un nouveau fichier, aucune ressource existante (rattaché ensuite à la demande du locataire)",
  "POST /api/files/sign": "StorageService.authorizeDocument : agence, ou partie au document (propriétaire, locataire, auteur)",
};
const rows = [];
const flags = [];
for (const file of walk(SRC)) {
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  sf.forEachChild(function visit(node) {
    if (ts.isClassDeclaration(node)) {
      const decos = ts.getDecorators(node) ?? [];
      const ctrl = decos.map((d) => d.getText(sf)).find((d) => d.startsWith("@Controller"));
      const base = ctrl?.match(/["'`]([^"'`]*)["'`]/)?.[1] ?? "";
      const classGuards = decos.map((d) => d.getText(sf)).filter((d) => /UseGuards|Roles/.test(d)).join(" ");
      for (const m of node.members) {
        if (!ts.isMethodDeclaration(m)) continue;
        const md = (ts.getDecorators(m) ?? []).map((d) => d.getText(sf));
        const verb = md.find((d) => /^@(Get|Post|Patch|Put|Delete)\(/.test(d));
        if (!verb) continue;
        const method = verb.match(/^@(\w+)/)[1].toUpperCase();
        const sub = verb.match(/["'`]([^"'`]*)["'`]/)?.[1] ?? "";
        const route = `/api/${[base, sub].filter(Boolean).join("/")}`;
        const roles = (md.find((d) => d.startsWith("@Roles")) ?? classGuards.match(/@Roles\([^)]*\)/)?.[0] ?? "").replace(/UserRole\./g, "").replace(/@Roles\(|\)/g, "");
        const guarded = /JwtAuthGuard/.test(md.join(" ") + classGuards);
        const perm = (md.find((d) => d.startsWith("@RequirePermissions")) ?? "").replace(/PERMISSION_KEYS\./g, "").replace(/@RequirePermissions\(|\)/g, "");
        const throttle = md.find((d) => d.startsWith("@Throttle"))?.match(/limit:\s*(\d+)/)?.[1];
        const body = m.body?.getText(sf) ?? "";
        const params = m.parameters.map((p) => p.getText(sf)).join(" ");
        const checks = OWNERSHIP.filter(([re]) => re.test(body)).map(([, label]) => label);
        const staffOnly = roles && !/OWNER|TENANT/.test(roles);
        const access = !guarded ? "public" : roles ? roles.replace(/,\s*/g, ", ") : "tout compte connecté";
        let ownership = !guarded ? "— (données publiques ou création anonyme)" : staffOnly ? "— (agence uniquement)" : checks.length ? checks.join(" ; ") : "à vérifier";
        // Identifiant de personne lu dans la requête (corps, requête ou paramètre nommé) par une route ouverte aux clients.
        if (!staffOnly && /@(Body|Query)\(["'](userId|ownerId|tenantId)["']\)/.test(params)) flags.push(`${method} ${route} lit un identifiant de personne dans la requête`);
        if (ownership === "à vérifier" && VERIFIED[`${method} ${route}`]) ownership = "vérifié : " + VERIFIED[`${method} ${route}`];
        if (ownership === "à vérifier") flags.push(`${method} ${route} : ouverte à ${access}, contrôle d'appartenance non trouvé dans le contrôleur (vérifier le service)`);
        rows.push(`| ${method} | \`${route}\` | ${access}${perm ? ` + ${perm}` : ""} | ${ownership} | ${throttle ? `${throttle}/min` : "120/min (global)"} |`);
      }
    }
  });
}
console.log(`# 15 — Routes de l'API : accès et appartenance (généré par \`apps/api/scripts/routes-audit.mjs\`)\n`);
console.log(`${rows.length} routes. Les gardes s'appliquent côté serveur (JwtAuthGuard, RolesGuard, PermissionsGuard) ; le super-admin passe les permissions.\n`);
console.log("| Méthode | Route | Accès | Appartenance de la ressource | Limite |\n|---|---|---|---|---|");
console.log(rows.sort((a, b) => a.split("`")[1].localeCompare(b.split("`")[1])).join("\n"));
console.log(`\n## Points signalés (${flags.length})\n`);
console.log(flags.length ? flags.map((f) => `- ${f}`).join("\n") : "Aucun.");
