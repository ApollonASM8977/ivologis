# 07 — Audit sécurité

Dernière mise à jour : 2026-11-17 (Phase 1, audit par lecture du code + requêtes en lecture seule sur la base de prod).
Statuts : `OUVERT` · `EN COURS` · `CORRIGÉ` (avec commit) · `ACCEPTÉ` (risque assumé, justifié).
Sévérité : CRITIQUE > ÉLEVÉ > MOYEN > FAIBLE.

## Constats

| ID | Sévérité | Constat | Preuve (fichier) | Correctif proposé | Statut |
|---|---|---|---|---|---|
| S-01 | CRITIQUE | Le dépôt GitHub est **public** et le `README.md` publie les identifiants des comptes de test. Ces 10 comptes **existent en prod** (statut ACTIVE), dont `admin@ivologis.ci` SUPER_ADMIN **sans 2FA**. Si le mot de passe n'a pas été changé, n'importe qui peut prendre le contrôle total du site. Les mots de passe restent aussi dans l'historique git. | `README.md` §5 ; requête prod `SELECT email, role, status, "totpEnabled" FROM users` (2026-11-17) | 1) **Utilisateur** : changer tout de suite les mots de passe de ces comptes en prod (ou les suspendre), activer la 2FA sur le Super Admin. 2) Code : retirer les mots de passe du README, ne plus les mettre dans le seed en clair. | OUVERT |
| S-02 | CRITIQUE | **Prise de contrôle de compte par numéro de téléphone** : `register()` rattache le nouveau compte à un dossier Propriétaire/Locataire existant trouvé **uniquement par numéro de téléphone**, sans code SMS. Quiconque connaît le numéro d'un propriétaire (créé par l'agence sans compte) accède à ses biens, locataires, paiements ; idem pour un locataire (bail, n° de pièce d'identité, garant). En CI les numéros circulent librement (WhatsApp, annonces). | `apps/api/src/auth/auth.service.ts` l.73-131 | Ne plus rattacher automatiquement. Rattachement seulement via **code d'invitation** à usage unique créé par l'agence (ou OTP SMS quand un fournisseur SMS existera). | OUVERT |
| S-03 | CRITIQUE | **Faux paiement** : `POST /payments/pay-rent` (locataire) marque le loyer **PAYÉ** avec une référence `SIM-…` et génère une **quittance officielle** sans qu'aucun argent ne soit encaissé. Un locataire peut produire des quittances sans payer (fraude, litige). | `apps/api/src/payments/payments.service.ts` l.107-131 | Le locataire **déclare** un paiement (référence de transaction obligatoire) → statut `PENDING` ; l'agence confirme → quittance. Intégration agrégateur (CinetPay…) avec webhook signé plus tard. | OUVERT |
| S-04 | ÉLEVÉ | **Fuite de données via le catalogue public** (`/api/catalog/*`, sans authentification) : les requêtes renvoient **toutes les colonnes** du bien (`saleBuyerName`, `saleBuyerPhone`, `saleFinalPrice`, `saleCommissionRate`, `currentTenantId`, `rentAmount`, `deposit`, `saleDocumentUrl`, `ownerId`…) + le nom du propriétaire. `getSaleDetail` ne filtre ni `VENDU` ni `archivedAt` → **nom et téléphone de l'acheteur final publics**. `getShortStayDetail` ne filtre pas `archivedAt`. | `apps/api/src/catalog/catalog.service.ts` | `select` explicite (liste blanche) ; filtrer `archivedAt: null`, `saleStatus != VENDU` ; ne pas exposer l'identité du propriétaire (l'agence fait l'intermédiaire). | OUVERT |
| S-05 | ÉLEVÉ | **« Mot de passe oublié » factice en production** : aucun email/SMS n'est envoyé (le lien n'est écrit dans la console qu'en dev). Aucun fournisseur email/SMS n'est installé. Le message « un lien a été envoyé » est faux. | `auth.service.ts` l.197-215 ; `apps/api/package.json` | Court terme : message honnête (« contactez l'agence ») + réinitialisation par un admin. Moyen terme : fournisseur email (Brevo/Resend) et SMS. | OUVERT |
| S-06 | ÉLEVÉ | 2FA obligatoire des comptes internes **désactivée** (`ENFORCE_MANDATORY_2FA = false`, demande utilisateur du 2026-10-07 pour la phase de test). | `auth.service.ts` l.19-22 | Remettre à `true` avant ouverture au public (décision utilisateur, voir `05_DECISIONS.md` D-03). | OUVERT |
| S-07 | ÉLEVÉ | **Rate limiting faussé derrière le proxy Render** : Express n'a pas `trust proxy` → `req.ip` = IP du proxy Render pour tous les visiteurs. La limite « 5 connexions/min » s'applique donc **à tout le monde en même temps** (déni de service facile du login) et les IP des sessions/audit sont fausses. | `apps/api/src/main.ts` (pas de `app.set("trust proxy", …)`) | `app.set("trust proxy", 1)` en production. | OUVERT (à confirmer en prod) |
| S-08 | MOYEN | Jeton JWT stocké dans un cookie **lisible par JavaScript** (`js-cookie`), valable 7 jours → volé par toute faille XSS. Atténuation existante : sessions révocables + `tokenVersion`. | `apps/web/lib/auth-store.ts`, `apps/web/lib/api.ts` | Cookie `httpOnly` posé par l'API (attention : `onrender.com` est sur la Public Suffix List → web et API sont cross-site, donc `SameSite=None; Secure` + protection CSRF) ou domaine personnalisé commun. P1. | OUVERT |
| S-09 | MOYEN | Pas d'en-têtes de sécurité côté web (CSP, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`). | `apps/web/next.config.js` | Ajouter `headers()` dans `next.config.js`. | OUVERT |
| S-10 | MOYEN | `next/image` accepte **n'importe quel hôte https** (`hostname: "**"`) → l'optimiseur d'images du site peut servir de proxy gratuit (abus de bande passante sur le plan gratuit). | `apps/web/next.config.js` | Restreindre à l'hôte de l'API (+ `images.unsplash.com` tant que les données de démo existent). | OUVERT |
| S-11 | MOYEN | Formulaires publics (demande de visite, demande de réservation, contact) protégés seulement par la limite globale 120 req/min → spam de fausses demandes, pollution du back-office. Pas de honeypot. | `sales.controller.ts`, `short-stay.controller.ts`, `contact.controller.ts` | `@Throttle` 5/min sur ces routes + champ honeypot. | OUVERT |
| S-12 | FAIBLE | Énumération de comptes : le login révèle « compte suspendu / en attente » avant de vérifier le mot de passe, et répond plus vite quand l'utilisateur n'existe pas (pas de bcrypt). | `auth.service.ts` l.147-165 | Vérifier le mot de passe d'abord, comparaison factice si utilisateur absent. | OUVERT |
| S-13 | FAIBLE | `confirmPayment` ne vérifie pas le statut courant : on peut « confirmer » un paiement annulé et générer une quittance. | `payments.service.ts` l.133 | Refuser si statut ≠ `PENDING`/`LATE`. | OUVERT |
| S-14 | FAIBLE | Uploads : type MIME déclaré par le client (pas de vérification des octets magiques), fichiers stockés en `bytea` dans Postgres (base Neon limitée à 1 Go). Les images sont servies sans authentification par UUID (non devinable). | `common/image-upload`, `storage/storage.service.ts` | Vérifier la signature binaire ; stockage objet externe (R2/S3) en P1. | OUVERT |
| S-15 | FAIBLE | NestJS 10 / multer : avis de sécurité (DoS) corrigés seulement en NestJS 12 (noté dans le README). | `README.md` §10 | `npm audit` + plan de montée de version. | OUVERT |

## Preuves par test (2026-11-17, API locale sur la branche Neon `audit-qa` = copie de la prod)
- **S-01 confirmé** : `POST /api/auth/login` avec les identifiants du README → jeton obtenu pour `admin@ivologis.ci` (SUPER_ADMIN), un locataire et un propriétaire. Les mots de passe de prod sont donc ceux publiés.
- **S-02 confirmé** : l'agence crée un dossier locataire (sans compte) avec le téléphone X ; un inconnu s'inscrit avec le téléphone X → `GET /tenants/me` lui renvoie le nom, le n° de pièce d'identité et le garant de la victime.
- **S-03 confirmé** : `POST /payments/pay-rent` (locataire, `method: WAVE`) → `status=PAID`, `transactionRef=SIM-…`, quittance `QUIT-2026-…` émise pour 350 000 FCFA, aucun encaissement.
- **S-04 confirmé** : `GET /api/catalog/sales` (sans authentification) renvoie 46 champs dont `saleBuyerName`, `saleBuyerPhone`, `saleCommissionRate`, `currentTenantId`, `rentAmount`. Après finalisation d'une vente, `GET /api/catalog/sales/:id` (public) renvoie `saleStatus=VENDU` + nom et téléphone de l'acheteur.

## Points déjà solides (vérifiés dans le code)
- Mots de passe : bcrypt 12 tours. Validation globale des DTO (`whitelist` + `forbidNonWhitelisted`).
- Gardes de rôle présentes sur chaque contrôleur ; isolation propriétaire/locataire via `assertOwnsResource` / `ownerScope` côté serveur.
- Sessions révocables (`Session` + `tokenVersion`), 2FA TOTP disponible, journal d'audit.
- Documents PDF servis par **URL signée HMAC** valable 10 min (`common/utils/signed-url.ts`).
- `helmet` côté API, CORS restreint à `CORS_ORIGIN`.

## Checklist Phase 6 (statut)
| Point | Statut |
|---|---|
| Hash fort des mots de passe | OK |
| JWT/sessions sécurisés | PARTIEL (S-08) |
| OTP SMS téléphone | ABSENT (S-02) |
| Autorisation par rôle sur chaque endpoint | OK (à re-vérifier route par route en Phase 6) |
| Validation serveur | OK |
| CSRF / XSS / injection | Prisma paramétré (OK) ; XSS : à auditer (aucun `dangerouslySetInnerHTML` vérifié encore) |
| Rate limiting / anti-bruteforce | PARTIEL (S-07, S-11) |
| Upload sécurisé | PARTIEL (S-14) |
| Secrets en variables d'env | OK (`.env` ignoré par git) — mais mots de passe de test publics (S-01) |
| En-têtes de sécurité | PARTIEL (S-09) |
| HTTPS | OK (Render) |
| Logs d'audit | OK |
| Sauvegardes | Procédure dans `docs/PROCEDURE-SAUVEGARDE.md` (à vérifier) |
| Données personnelles (loi ivoirienne / ARTCI) | À FAIRE (Phase 2 + 6) |
| Chiffrement des pièces d'identité | ABSENT |
| Webhooks de paiement signés et idempotents | SANS OBJET (aucun paiement réel) |
