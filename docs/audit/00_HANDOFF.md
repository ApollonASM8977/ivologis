# 00 — HANDOFF (à lire en premier)

**Projet** : IVOLOGIS — `G:\Projet a mettre sur github\IMMO+` (monorepo npm : `apps/api` NestJS+Prisma, `apps/web` Next.js 15, `packages/shared`). Dépôt GitHub **PUBLIC** `ApollonASM8977/ivologis`, branche `main`. Prod : `ivologis-web.onrender.com` / `ivologis-api.onrender.com` (Render gratuit, déploiement manuel via MCP Render `trigger_deploy`), base Neon projet `fancy-star-15869804` (branche `main` = prod).

**Phase en cours** : PHASE 1 terminée (2026-11-17) → démarrer PHASE 2 (recherche marché/légal).

**État** : `01_ARCHITECTURE.md`, `03_GAP_ANALYSIS.md` (partie 1), `07_SECURITE.md` remplis. 4 failles critiques/élevées **confirmées par test** (S-01 à S-04).

**Prochaine action exacte** : Phase 2 → recherches web (sources + dates) et remplir `02_MARCHE_CI_AFRIQUE.md` ; puis Phase 3 (partie 2 du gap) et Phase 4 (backlog). Les correctifs S-02/S-03/S-04/E-02 seront les premières tâches P0 de la Phase 5.

**Environnement de test local** (ne jamais tester contre la prod) :
- Branche Neon `audit-qa` (`br-shy-fog-b1hl85o4`), copie de la prod du 2026-11-17. Sa chaîne de connexion et un `JWT_SECRET` de test sont dans le fichier temporaire `qa.env` du scratchpad de session (hors dépôt) ; sinon la récupérer avec l'outil Neon `get_connection_string` (branch_id ci-dessus).
- API locale : `cd apps/api && node dist/src/main.js` avec les variables de `qa.env` (PORT 3101). Web local : `cd apps/web && NEXT_PUBLIC_API_URL=http://localhost:3101 npx next dev -p 3100`.
- Données de test ajoutées sur `audit-qa` uniquement : paiement simulé novembre (Yao Patrick), document de vente « Test audit », vente finalisée « Terrain Riviera Golf 3 », locataire « Locataire Victime Audit » + compte attaquant.

**Règles** :
- Commits : message seul, **jamais de ligne Co-Authored-By**. Format `type(ID): ...` en français.
- **Ne pas pousser sur GitHub** tant que S-01..S-04 ne sont pas corrigés (dépôt public : `07_SECURITE.md` décrit des failles exploitables). Voir D-04.
- Aucune suppression de données en prod sans accord explicite. Ne jamais se connecter au site de prod avec les mots de passe de test.
- `prisma migrate dev` échoue (non interactif) : `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script` → dossier de migration créé à la main → `prisma migrate deploy` (sur `audit-qa` d'abord).
- Composant `Card` : ne pas surcharger le padding via `className`, utiliser un `<div>`.

**Attend l'utilisateur** :
1. URGENT : changer en prod les mots de passe des 10 comptes du seed (le Super Admin a encore le mot de passe publié) et activer la 2FA du Super Admin (S-01).
2. Décisions : 2FA obligatoire (D-03), modèle économique mono-agence vs SaaS multi-agences (E-10), sort des 6 annonces de démo en prod (T-01), dépôt public ou privé (D-04).
