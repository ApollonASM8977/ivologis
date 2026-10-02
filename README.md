# IVOLOGIS — Plateforme de gestion immobilière (Côte d'Ivoire)

IVOLOGIS est une application SaaS complète de gestion immobilière : biens, propriétaires,
locataires, contrats de bail, paiements (Orange Money / MTN Money / Moov Money / Wave / cash /
virement), maintenance, statistiques et notifications — adaptée au contexte ivoirien (devise
XOF, communes d'Abidjan, documents locaux).

Ce dépôt est un monorepo npm workspaces :

```
IMMO+/
├── apps/
│   ├── api/     Backend NestJS + Prisma + PostgreSQL (REST API)
│   └── web/     Application web Next.js (App Router) — Super Admin, Propriétaire, Locataire
├── packages/
│   └── shared/  Enums, libellés FR et constantes partagés entre le backend et le web
```

L'application mobile (locataire + propriétaire, React Native / Expo) est prévue en **Phase 2**
(voir section Roadmap) — l'architecture backend est déjà prête à la servir (même API REST).

## 1. Stack technique

| Couche | Choix |
|---|---|
| Backend | NestJS 10 + TypeScript, Prisma ORM, PostgreSQL |
| Base de données | PostgreSQL (Neon serverless en dev/prod, ou toute instance Postgres) |
| Auth | JWT (Bearer), bcryptjs, rate limiting sur `/auth/login` |
| Web | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS |
| Data fetching | TanStack Query (React Query) |
| État global | Zustand (session utilisateur) |
| Graphiques | Recharts v3 |
| PDF | pdfkit (contrats, quittances générés côté serveur) |
| Upload fichiers | Multer (stockage local `/uploads` en dev ; Cloudinary/S3 recommandé en prod) |

## 2. Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Une base PostgreSQL (une instance Neon est déjà provisionnée pour ce projet — voir `apps/api/.env`)

## 3. Installation

À la racine du monorepo :

```bash
npm install
```

Cette commande installe les dépendances des trois packages (`apps/api`, `apps/web`,
`packages/shared`) grâce aux workspaces npm.

Construire le package partagé (nécessaire avant de lancer l'API ou le web) :

```bash
npm run build:shared
```

## 4. Variables d'environnement

### `apps/api/.env` (déjà rempli avec une base Neon de développement)

```
DATABASE_URL=postgresql://...          # Connexion PostgreSQL
JWT_SECRET=...                         # Secret de signature des tokens
JWT_EXPIRES_IN=7d
PORT=3001
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./uploads
```

Un exemple est fourni dans `apps/api/.env.example`.

### `apps/web/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 5. Base de données — migrations et données de test

```bash
cd apps/api
npx prisma generate       # génère le client Prisma
npx prisma migrate dev    # applique les migrations (déjà fait sur la base fournie)
npx ts-node prisma/seed.ts  # injecte des données réalistes (voir comptes ci-dessous)
```

Le seed crée :
- 1 compte **Super Admin** (l'entreprise IVOLOGIS)
- 1 compte **Agent immobilier** (admin secondaire, avec permissions étendues sauf paramètres/comptes)
- 3 **propriétaires** (Kouadio Jean, Fatou Diarra, Marc Koffi) avec accès de connexion
- 4 **locataires** (Yao Patrick, Aïcha Koné, Bamba Ibrahim, Koffi Serge)
- 5 **biens** répartis à Cocody/Riviera, Marcory, Bingerville, Yopougon
- 3 **contrats de bail actifs**, plusieurs **paiements** (payés / en attente), 2 **demandes de maintenance**

### Comptes de test

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Super Admin | `admin@ivologis.ci` | `Ivologis@2026` |
| Agent immobilier | `agent@ivologis.ci` | `Agent@2026` |
| Propriétaire | `kouadio.jean@ivologis.ci` | `Proprio@2026` |
| Propriétaire | `fatou.diarra@ivologis.ci` | `Proprio@2026` |
| Locataire | `yao.patrick@ivologis.ci` | `Locataire@2026` |
| Locataire | `aicha.kone@ivologis.ci` | `Locataire@2026` |

## 6. Lancer le projet en local

Dans deux terminaux séparés (ou avec les scripts racine ci-dessous) :

```bash
# Terminal 1 — API (http://localhost:3001/api)
npm run dev:api

# Terminal 2 — Web (http://localhost:3000)
npm run dev:web
```

Ouvrez `http://localhost:3000` : vous êtes redirigé vers `/login`. Connectez-vous avec l'un des
comptes ci-dessus — vous serez redirigé vers le tableau de bord correspondant à votre rôle :

- Super Admin / Agent → `/admin/dashboard`
- Propriétaire → `/owner/dashboard`
- Locataire → `/tenant/dashboard`

### Dépannage

- **`Can't reach database server` au tout premier démarrage de l'API** : la base Neon se met en
  veille après une période d'inactivité et se réveille en quelques secondes. Relancez simplement
  `npm run dev:api` une seconde fois si le tout premier démarrage échoue.

## 7. Comment tester

- **Auth & rôles** : connectez-vous avec chaque compte de test et vérifiez que chaque rôle ne
  voit que son périmètre (un propriétaire ne voit jamais les biens d'un autre propriétaire).
- **Biens** : Super Admin → *Biens* → *Ajouter un bien* → vérifiez l'apparition dans la liste et
  dans le tableau de bord du propriétaire associé.
- **Contrats** : *Contrats* → *Nouveau contrat* (choisir un bien vacant) → le bien passe en
  statut "Loué" et un contrat PDF peut être généré/téléchargé.
- **Paiements** : *Paiements* → *Enregistrer un paiement* → une quittance PDF est générée
  automatiquement et téléchargeable. Côté locataire, *Payer maintenant* simule un paiement Mobile
  Money instantané (aucune intégration réelle Orange/MTN/Wave pour l'instant, voir Roadmap).
- **Maintenance** : côté locataire, *Nouvelle demande* → côté Super Admin, changez le statut et
  assignez un technicien → le locataire reçoit une notification in-app.
- **API seule** : la collection de routes est listée en section 9. Exemple :

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@ivologis.ci","password":"Ivologis@2026"}'
```

## 8. Rôles et permissions

| Rôle | Périmètre |
|---|---|
| `SUPER_ADMIN` | Accès total : biens, propriétaires, locataires, paiements, contrats, maintenance, statistiques, paramètres, comptes admin |
| `ADMIN_AGENT` | Créé par le Super Admin avec des permissions granulaires (`properties.manage`, `payments.manage`, etc.), jamais l'accès aux paramètres sensibles ni à la gestion des comptes admin sauf autorisation explicite |
| `OWNER` | Uniquement ses propres biens/locataires/paiements/contrats — isolation stricte vérifiée côté backend (impossible d'accéder aux données d'un autre propriétaire même en devinant un ID) |
| `TENANT` | Uniquement son propre logement, contrat, paiements et demandes de maintenance |

## 9. API — vue d'ensemble

Toutes les routes sont préfixées par `/api`. Auth par header `Authorization: Bearer <token>`.

```
POST   /auth/register            POST /auth/login          GET /auth/me
POST   /auth/forgot-password     POST /auth/reset-password

GET/POST      /properties        GET/PATCH/DELETE /properties/:id
POST          /properties/:id/images

GET/POST      /owners            GET/PATCH /owners/:id      GET /owners/me
GET/POST      /tenants           GET/PATCH /tenants/:id     GET /tenants/me

GET/POST      /leases            GET/PATCH /leases/:id
POST /leases/:id/renew  POST /leases/:id/terminate  POST /leases/:id/pdf

GET/POST      /payments          GET /payments/:id          GET /payments/overdue
POST /payments/simulate   POST /payments/:id/confirm   POST /payments/:id/receipt   GET /payments/export

GET/POST      /maintenance       GET/PATCH /maintenance/:id  POST /maintenance/:id/comments
GET/POST      /technicians

GET /reports/dashboard   GET /reports/financial
GET /reports/owner/:id   GET /reports/property/:id

GET/PATCH     /settings
GET           /notifications/me   PATCH /notifications/:id/read
```

## 10. Sécurité

- Mots de passe hashés avec **bcryptjs** (12 rounds).
- Authentification **JWT** stateless, validation stricte des DTO (`class-validator`), en-têtes
  durcis via **helmet**.
- **Rate limiting** global (120 req/min) + limite stricte sur `/auth/login` et
  `/auth/forgot-password` (5 req/min) via `@nestjs/throttler`.
- **Isolation des données par propriétaire** appliquée côté service (jamais côté client) : un
  propriétaire externe ne peut jamais lire, modifier ou lister les biens/locataires/paiements
  d'un autre propriétaire, même en connaissant un identifiant.
- **Journal d'audit** (`audit_logs`) pour les connexions et actions sensibles.
- Upload de fichiers limité en taille (5 Mo) et filtré par extension (images uniquement pour les
  photos de biens).
- **Note de durcissement avant mise en production** : `multer` (upload de fichiers) contient des
  correctifs de sécurité (DoS) disponibles uniquement à partir de `@nestjs/platform-express@12`
  (NestJS 12), une montée de version majeure volontairement non appliquée dans ce MVP pour ne
  pas déstabiliser l'ensemble du backend sans campagne de tests dédiée. L'endpoint d'upload est
  déjà protégé par authentification, contrôle de rôle et limite de taille ; prévoir la migration
  NestJS 10 → 12 avant un lancement public à fort trafic. Exécutez `npm audit` régulièrement.

## 11. Déploiement (production)

- **Web** : Vercel (ou tout hébergeur Next.js). Définir `NEXT_PUBLIC_API_URL` vers l'URL de l'API.
- **API** : Render / Railway / VPS. Définir toutes les variables de `apps/api/.env.example`,
  puis `npx prisma migrate deploy` avant le premier démarrage. Installer en production avec
  `npm ci --omit=dev` (exclut les outils de build comme `@nestjs/cli`).
- **Base de données** : Neon (PostgreSQL serverless) — déjà utilisée en développement, prête pour
  la production (changer simplement de branche/projet Neon si besoin d'isoler prod/dev).
- **Stockage fichiers** : remplacer le stockage disque local (`UPLOAD_DIR`) par Cloudinary ou un
  bucket S3-compatible avant la mise en production (le code d'upload est isolé dans
  `PropertiesController` / `PdfService`, migration localisée).

## 12. Roadmap

**Phase 1 (livrée dans ce dépôt)** — Auth & rôles, dashboard Super Admin, gestion biens/
propriétaires/locataires, contrats, paiements manuels + simulation Mobile Money, maintenance,
relevés financiers, paramètres.

**Phase 2** — Intégration réelle Orange Money / MTN Money / Wave (webhooks de confirmation),
notifications SMS/WhatsApp réelles, signature électronique des contrats, export PDF avancé,
carte interactive des biens, application mobile complète (React Native / Expo) pour propriétaires
et locataires.

**Phase 3** — Prédiction des impayés (IA), marketplace d'artisans, portail public d'annonces,
extension multi-pays Afrique de l'Ouest.
