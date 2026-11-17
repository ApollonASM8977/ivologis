# 00 — HANDOFF (à lire en premier)

**Projet** : IVOLOGIS — `G:\Projet a mettre sur github\IMMO+` (monorepo npm : `apps/api` NestJS+Prisma, `apps/web` Next.js 15, `packages/shared`). Dépôt GitHub **PUBLIC** `ApollonASM8977/ivologis`, branche `main`. Prod : `ivologis-web.onrender.com` / `ivologis-api.onrender.com` (Render plan gratuit, déploiement manuel via MCP Render `trigger_deploy`), base Neon projet `fancy-star-15869804`.

**Phase en cours** : PHASE 1 — Audit (démarrée le 2026-11-17).

**État** : dossier `docs/audit/` créé. Constats sécurité critiques déjà notés dans `07_SECURITE.md` (S-01 à S-12).

**Prochaine action exacte** : continuer la Phase 1 → compléter `01_ARCHITECTURE.md` (routes web + API), puis `03_GAP_ANALYSIS.md` partie « Existant » (fonctions factices, traces IA, perf, SEO, a11y). Puis lancer l'app en local et tester les parcours.

**Fichiers en cours** : `docs/audit/01_ARCHITECTURE.md`, `docs/audit/03_GAP_ANALYSIS.md`.

**Règles à respecter** :
- Commits : message seul, **jamais de ligne Co-Authored-By** (règle utilisateur). Format `type(ID): ...` en français.
- Ne jamais supprimer de données en prod sans accord explicite de l'utilisateur.
- Ne jamais se connecter au site de prod avec les mots de passe de test.
- `prisma migrate dev` échoue (non interactif) : utiliser `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script`, créer le dossier de migration à la main, puis `prisma migrate deploy`.
- Composant `Card` : ne pas surcharger le padding via `className` (bug), utiliser un `<div>`.

**Bloqué / attend l'utilisateur** : rotation des mots de passe des comptes de test en prod (voir S-01).
