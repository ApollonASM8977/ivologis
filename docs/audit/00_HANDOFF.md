# 00 — HANDOFF (à lire en premier)

**Projet** : IVOLOGIS — `G:\Projet a mettre sur github\IMMO+` (monorepo npm : `apps/api` NestJS+Prisma, `apps/web` Next.js 15, `packages/shared`). Dépôt GitHub **PUBLIC** `ApollonASM8977/ivologis`, branche `main`. Prod : `ivologis-web.onrender.com` / `ivologis-api.onrender.com` (Render gratuit, déploiement manuel via MCP Render `trigger_deploy`), base Neon projet `fancy-star-15869804` (branche `main` = prod).

**Phase en cours** : PHASE 5 (implémentation). Phases 1-4 terminées le 2026-11-17. **Tous les P0 codables sont FAITS** (commits locaux, non poussés, non déployés) : P0-01 `f971151`, P0-02 `f12e37d`, P0-03 `ed339c0`, P0-04 `5ce49e5`, P0-05 `dae6275`, P0-06 `ab22d67`, P0-07 `d63bf57`, P0-08 `30048da`, P0-09 `d22a13b`, P0-10 `37fff8a`, P0-11 `78d29a5`, P0-12 `975d588`, P0-13 `9795576`, P0-14 `f476964`, P0-15 `35bfa1c`. Build web de production OK, 19/19 tests unitaires API OK.

**Migrations nouvelles** (appliquées sur `audit-qa` uniquement, s'appliqueront en prod au déploiement de l'API) : `20261117120000_invite_codes`, `20261117130000_demo_listings` (marque les 6 annonces Unsplash en démo), `20261117140000_property_neighborhood` (Riviera → Cocody/quartier, Assinie → ville Assinie-Mafia), `20261117150000_company_legal_identity`.

**Prochaine action exacte** : P1 dans cet ordre : P1-03 (boutons WhatsApp/appel de l'agence sur les fiches, numéro = `whatsappPhone`/`phone` de `GET /settings/public`) → P1-05 (page « Comment on vérifie les annonces ») → P1-01 (location longue durée au catalogue) → P1-02 (filtres) → P1-04 (SEO SSR). Puis Phase 7 (design) et Phase 8 (QA).

**Environnement de test local** (ne jamais tester contre la prod) :
- Branche Neon `audit-qa` (`br-shy-fog-b1hl85o4`), copie de la prod du 2026-11-17 + données de test. Chaîne de connexion : outil Neon `get_connection_string` (branch_id ci-dessus) ; un `qa.env` (DATABASE_URL, JWT_SECRET de test, PORT=3101, CORS_ORIGIN=http://localhost:3100) existe dans le scratchpad de session.
- API : `npm run build:api` puis `cd apps/api && node dist/src/main.js` avec les variables de `qa.env`. Web : `cd apps/web && NEXT_PUBLIC_API_URL=http://localhost:3101 npx next dev -p 3100` (arrêter le dev server avant `npm run build:web`).

**Règles** :
- Commits : message seul, **jamais de ligne Co-Authored-By**. Format `type(ID): ...` en français.
- **Ne pas pousser sur GitHub** tant que l'utilisateur n'a pas changé les mots de passe (S-01) et décidé public/privé (D-04).
- Aucune suppression de données en prod sans accord explicite. Ne jamais se connecter au site de prod avec les mots de passe de test.
- `prisma migrate dev` échoue (non interactif) : `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script` → dossier de migration créé à la main (écrire en UTF-8 sans BOM) → `prisma migrate deploy` (sur `audit-qa` d'abord).
- Composant `Card` : ne pas surcharger le padding via `className`, utiliser un `<div>`.
- **Ne jamais réécrire un fichier source avec PowerShell `Get-Content`/`Set-Content`** (ANSI + BOM → accents corrompus). Utiliser l'outil Edit.
- Sous Windows, arrêter l'API locale avant `prisma generate`.
- `/auth/login` et `/auth/register` : 5 req/min/IP ; formulaires publics : 5 req/min/IP.

**Déploiement (quand l'utilisateur l'autorise)** : `git push` → MCP Render `trigger_deploy` API `srv-db00q9mgekts73fobbc0` (applique les migrations) puis web `srv-db00qg942hec73efhqg0` → vérifier S-07 (IP réelle dans Profil → Sessions) → saisir l'identité légale dans Paramètres.

**Attend l'utilisateur** :
1. URGENT : changer en prod les mots de passe des 10 comptes du seed (le Super Admin a encore le mot de passe publié) et activer sa 2FA (S-01, P0-17).
2. Décisions : 2FA obligatoire (D-03/P0-16), mono-agence vs SaaS multi-agences (E-10), sort des 6 annonces démo (T-01, désormais marquées « Démo »), dépôt public ou privé (D-04).
3. Données légales réelles : raison sociale, RCCM, NCC, agrément, ARTCI, directeur de publication, WhatsApp (à saisir dans Paramètres après déploiement).
4. Comptes externes pour débloquer P1-10 (email), P1-11 (paiement CinetPay), P1-12 (stockage objet).
