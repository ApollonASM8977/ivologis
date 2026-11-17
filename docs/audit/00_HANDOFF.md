# 00 — HANDOFF (à lire en premier)

**Projet** : IVOLOGIS — `G:\Projet a mettre sur github\IMMO+` (monorepo npm : `apps/api` NestJS+Prisma, `apps/web` Next.js 15, `packages/shared`). Dépôt GitHub **PUBLIC** `ApollonASM8977/ivologis`, branche `main`. Prod : `ivologis-web.onrender.com` / `ivologis-api.onrender.com` (Render gratuit, déploiement manuel via MCP Render `trigger_deploy`), base Neon projet `fancy-star-15869804` (branche `main` = prod).

**Phase en cours** : PHASE 5 (implémentation). Phases 1-4 terminées le 2026-11-17. **Tous les P0 codables sont FAITS** (commits locaux, non poussés, non déployés) : P0-01 `f971151`, P0-02 `f12e37d`, P0-03 `ed339c0`, P0-04 `5ce49e5`, P0-05 `dae6275`, P0-06 `ab22d67`, P0-07 `d63bf57`, P0-08 `30048da`, P0-09 `d22a13b`, P0-10 `37fff8a`, P0-11 `78d29a5`, P0-12 `975d588`, P0-13 `9795576`, P0-14 `f476964`, P0-15 `35bfa1c`. Build web de production OK, 19/19 tests unitaires API OK.

**Migrations nouvelles** (appliquées sur `audit-qa` uniquement, s'appliqueront en prod au déploiement de l'API) : `20261117120000_invite_codes`, `20261117130000_demo_listings` (marque les 6 annonces Unsplash en démo), `20261117140000_property_neighborhood` (Riviera → Cocody/quartier, Assinie → ville Assinie-Mafia), `20261117150000_company_legal_identity`.

**Depuis** : P0-18 `dbab749` (validation des séjours par l'agence), P1-03 `b1b484c` (WhatsApp/appel agence), P1-05 `306e919` (page `/verification`), P1-01 `b65170d` (logements à louer + coût d'entrée). Migrations en plus : `20261117160000_short_stay_approval`, `20261117170000_rental_listing`.

**Session du 2026-11-17 après-midi** : P1-02 `b18843c` (filtres/tri/pagination), P1-04 `2972c65` (SEO), P1-06 `954b3fa` (nouvelle identité + recherche d'accueil, design system v1 dans `06`), T-11 `9d3791c`, E-13 `f0e79d6`. Build prod OK, 20/20 tests. Poussé et déployé (`dep-dbu7ig6c6qcc73fckkqg` API, `dep-dbu7ig8jo6nc738e0fb0` web).

**Retour utilisateur du 2026-11-17 soir (important)** : la nouvelle identité de P1-06 a été **refusée** → design d'origine restauré (`d3e6adf`, décision D-10 : ne jamais changer couleurs/polices/accueil sans accord), animations et chargements ajoutés (`84c545f`), boîte « Demandes clients » + notifications (`669d3a6`, A-01). L'utilisateur juge le travail trop superficiel : **audit écran par écran des espaces en cours**, consigné dans `12_AUDIT_ESPACES.md`. Fait : espace locataire (L-01, L-02, M-01..05) et propriétaire (O-01..03), fiche maintenance admin (AD-01), fiche bien (PD-01, PD-03). Afficher le bloc « Demande interprétée (améliorée) » à chaque réponse (AGENTS.md).

**Prochaine action exacte** : pousser et déployer (API puis web) pour que la prod quitte le design refusé ; puis audit admin en profondeur (bien → bail → paiement → quittance → relevé, import CSV, paramètres, équipe/permissions) dans `12_AUDIT_ESPACES.md`. Ensuite : décisions A-02/A-03, S-17, P1-07, P1-08, P1-14, performance (LCP).

**Comptes de test sur `audit-qa`** : le mot de passe du propriétaire `kouadio.jean@ivologis.ci` a été réinitialisé sur la branche QA uniquement (valeur dans le scratchpad de session, `owner-qa-password.txt`) ; la prod n'est pas touchée.

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

**Déploiement** : FAIT le 2026-11-17 à 11:55 UTC (commit `11dc937`, deploys `dep-dbu40ijm8hqs73e2b6v0` API et `dep-dbu40j68bjmc73a91kgg` web, statut `live`). Vérifié en prod : 6 migrations appliquées, catalogue sans champ interne, `/verification` en ligne avec en-têtes. Donnée de test ajoutée en prod (accord implicite D-06) : « Maison Yopougon Niangon » publiée à la location et marquée Démo. Procédure de redéploiement : `git push` puis `trigger_deploy` (workspace `tea-dai7od3m8hqs73f60pf0`) API puis web. Reste à vérifier par l'utilisateur : IP réelle dans Profil → Sessions (S-07).

**Décisions utilisateur** : D-06 (comptes de test conservés jusqu'à la fin, 2FA et vrais comptes ensuite), D-07 (fournisseurs, non souscrits), D-08 (hors ligne en PWA), D-09 (AGENTS.md du projet).

**Attend l'utilisateur** :
1. Fin des développements : 2FA (P0-16), vrais comptes, suppression des comptes de test (P0-17).
2. Domaine + comptes Brevo, Paystack (test), Cloudflare R2 pour débloquer P1-10/11/12 (`09_FOURNISSEURS.md`).
3. Décisions : mono-agence vs SaaS (E-10), propriétaire sans droit de création (E-13), qui paie les frais de paiement, réponses aux questions de `10_MODE_HORS_LIGNE.md` §7.
4. Données légales réelles à saisir dans Paramètres.
