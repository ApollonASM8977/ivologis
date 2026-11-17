# 01 — Architecture (cartographie de l'existant)

Dernière mise à jour : 2026-11-17 (Phase 1).

## 1. Stack
| Couche | Technologie | Emplacement |
|---|---|---|
| API | NestJS 10, TypeScript 5.9, Prisma 5, PostgreSQL (Neon serverless, PG 18, eu-central-1) | `apps/api` |
| Web | Next.js 15.5 (App Router), React 19, Tailwind 3, TanStack Query 5, Zustand 5, react-hook-form, zod, motion, recharts, sonner, lucide | `apps/web` |
| Partagé | Enums, libellés FR, constantes, `formatXOF` | `packages/shared` (à compiler : `npm run build:shared`) |
| PDF / Word | pdfkit (quittances, contrats, relevés), docx | `apps/api/src/common/pdf`, `common/docx` |
| Auth | JWT Bearer (7 j), bcryptjs 12, TOTP (otplib), sessions révocables | `apps/api/src/auth` |
| Hébergement | Render (plan **gratuit**, mise en veille ~15 min, réveil jusqu'à ~1 min) — services `srv-db00q9mgekts73fobbc0` (API) et `srv-db00qg942hec73efhqg0` (web). Pas d'auto-deploy effectif : déclencher via MCP Render. | — |
| Base | Neon projet `fancy-star-15869804` (`ivologis`), limite 1 Go, 0,25 CU | — |
| CI | GitHub Actions `.github/workflows/ci.yml` : install, build shared, prisma generate, tsc API, tests unitaires API, tsc web, build web | — |
| PWA | `apps/web/public/sw.js` (network-first pour HTML, cache pour `/_next/static`), `app/manifest.ts`, page `/offline` | — |

## 2. Variables d'environnement
**API** (`apps/api/.env.example`) : `DATABASE_URL`, `JWT_SECRET` (obligatoire, sinon refus de démarrer), `JWT_EXPIRES_IN` (7d), `PORT` (3001), `NODE_ENV`, `CORS_ORIGIN` (liste séparée par virgules), `UPLOAD_DIR` (**inutilisé** : les fichiers sont en base), `COMPANY_NAME`, `COMPANY_CURRENCY`.
**Web** (`apps/web/.env.example`) : `NEXT_PUBLIC_API_URL`.
Absentes (donc fonctionnalités inexistantes) : fournisseur email, SMS, WhatsApp, agrégateur de paiement, stockage objet, cartographie.

## 3. Rôles
`SUPER_ADMIN` (tout), `ADMIN_AGENT` (permissions fines `PERMISSION_KEYS`), `OWNER` (ses biens uniquement), `TENANT` (son logement). **Pas de rôle « agence externe » ni « acheteur/visiteur »** : les visiteurs agissent en invité (nom + téléphone).

## 4. Modèle de données (Prisma, 27 modèles)
- Comptes : `User`, `Permission`, `UserPermission`, `Session`, `AuditLog`, `Notification`.
- Acteurs : `Owner` (RCCM, banque, pièce d'identité, taux de commission), `Tenant` (état civil, revenus, garant, contact d'urgence), `Technician`.
- Biens : `Property` (type, commune, ville, pays, lat/long, pièces, surface, meublé, équipements, repère, loyer/caution/avance, statut, **vente** : prix, commission, statut, titre foncier + vérifié, **courte durée** : tarif/nuit, `virtualTourUrl`, compteurs vues/demandes), `PropertyImage`.
- Location longue : `Lease` (types habitation nue/meublée/commercial/professionnel/terrain, `details` JSON, révision, solde de caution), `Inspection` (état des lieux entrée/sortie), `TenantRequest` (résiliation…), `Payment`, `Receipt`, `OwnerPayout`.
- Courte durée : `ShortStayBooking` (référence `RES-…`, invité possible).
- Vente : `PropertySaleOffer`, `PropertySaleDocument`, `PropertyVisitRequest` (référence `RDV-…`, invité possible).
- Maintenance : `MaintenanceRequest`, `MaintenanceComment`.
- Divers : `CompanySettings`, `Document`, `FinancialReport` (**jamais alimenté**, à vérifier), `ContactRequest`, `StoredFile` (fichiers en `bytea`).
- Enums CI : moyens de paiement `ORANGE_MONEY, MTN_MONEY, MOOV_MONEY, WAVE, CASH, BANK_TRANSFER` ; titres fonciers `ACD, TITRE_FONCIER, LETTRE_ATTRIBUTION, ARRETE_CONCESSION, AUTRE` ; types de biens `VILLA, APPARTEMENT, STUDIO, TERRAIN, IMMEUBLE, BUREAU, MAGASIN` (**manquent** : cour commune, duplex, chambre, entrepôt, lotissement).
- 11 migrations dans `apps/api/prisma/migrations`.

## 5. API (préfixe `/api`) — modules
| Module | Routes principales | Accès |
|---|---|---|
| auth | `register, login, logout, logout-all, forgot-password, reset-password, 2fa/*, sessions, me` | public / JWT |
| catalog | `GET catalog/sales`, `sales/:id`, `short-stay`, `short-stay/:id` | **public** |
| properties | CRUD, `me` (locataire), images | admin/agent/owner |
| sales | `sales`, `properties/:id/sale`, offres, documents, finalisation, demandes de visite (POST **public/invité**) | mixte |
| short-stay | réservations, `request` (POST **public/invité**), confirmer/refuser/payé/annuler/terminer | mixte |
| owners | CRUD, revenus, solde, reversements | admin/agent/owner |
| tenants | CRUD, import CSV, statut | admin/agent/owner/tenant |
| leases | CRUD, document PDF/Word, renouvellement, résiliation, révisions, états des lieux, solde de caution | admin/agent (+ lecture owner/tenant) |
| payments | liste, création, `simulate`, `pay-rent` (**simulé**), confirmation, quittance, impayés, relance, export CSV | rôles variés |
| maintenance / technicians | demandes, commentaires, techniciens | rôles variés |
| tenant-requests | demandes locataires + pièce jointe | tenant/admin |
| reports | dashboard, financier, relevé propriétaire (+ export), bien | admin/agent/owner |
| notifications | `me`, lecture | JWT (in-app uniquement) |
| settings, users, audit-logs, search, contact-requests (POST public), files (`sign`, `GET :id`) | — | — |

## 6. Web — routes (App Router)
- Vitrine `(marketing)` : `/`, `/catalogue` (+ `sales`, `sales/[id]`, `short-stay`, `short-stay/[id]`, `my-requests`), `/securite`, `/mentions-legales`, `/confidentialite`.
- Auth : `/login`, `/register`, `/forgot-password`, `/reset-password`, `/offline`.
- `/admin/*` : dashboard, properties, owners, tenants, leases, payments, maintenance, technicians, tenant-requests, sales, short-stay, catalog, contact-requests, reports, settings, team, audit-log, profile.
- `/owner/*` : dashboard, properties, tenants, leases, payments, maintenance, reports, catalog, profile.
- `/tenant/*` : dashboard, property, lease, payments, maintenance, requests, short-stay, catalog, profile.
- `middleware.ts` : redirections selon les cookies `ivologis_token` / `ivologis_role` (contrôle d'accès réel fait par l'API).
- SEO : `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `manifest.ts`.

## 7. Fichiers / uploads
Multer en mémoire → `StorageService.save()` écrit le binaire dans `stored_files` (Postgres) → URL `/api/files/:id`. Images : JPG/PNG/WebP (3-5 Mo). Documents : PDF + images (5-10 Mo). PDF/DOCX servis seulement avec signature HMAC (`/files/sign`). En prod au 2026-11-17 : 4 fichiers, 96 kB.

## 8. Notifications
Uniquement **in-app** (table `notifications`). Les enums `EMAIL/SMS/WHATSAPP` existent mais aucun envoi n'est implémenté.

## 9. Tests
`apps/api/test/unit.test.js` (node:test, sur `dist`), `apps/api/test/api.integration.test.js`. Aucun test web. Pas de lint configuré côté API ; `next lint` côté web.

## 10. Données en prod (lecture seule, 2026-11-17)
10 comptes (tous issus du seed : 2 SUPER_ADMIN, 1 agent, 3 propriétaires, 4 locataires), 12 biens dont 6 « démo » ajoutés le 2026-11 **sans marquage démo** (voir S-01, G-xx).
