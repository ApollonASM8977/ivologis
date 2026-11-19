# 08 — Checklist QA

Statut : en cours (rempli au fil des tâches, finalisé en Phase 8). Environnement : API locale + branche Neon `audit-qa`.

## Commandes de vérification
```bash
npm run build:shared
npx tsc --noEmit -p apps/api/tsconfig.json
npm run test --workspace=@ivologis/api      # 19 tests au 2026-11-17
npx tsc --noEmit -p apps/web/tsconfig.json
npm run build:web
```

## Vérifications faites (2026-11-17)
| Domaine | Vérification | Résultat |
|---|---|---|
| Inscription | Sans code / mauvais code / bon code / code réutilisé / propriétaire avec téléphone d'autrui | OK (P0-01) |
| Paiement | Déclaration → PENDING ; doublon → 409 ; quittance sur PENDING → 400 ; confirmation → PAID + quittance ; `simulate` → 404 | OK (P0-02) |
| Catalogue public | 24 champs publics, aucun champ interne ; bien vendu → 404 ; demande sur bien vendu / dates passées → 400 | OK (P0-03) |
| Documents | Document de vente : admin OK, propriétaire du bien OK, autre propriétaire 403 ; reçu de séjour OK | OK (P0-04) |
| Démo | Badge sur cartes, bandeau sur fiches, pas de « Titre vérifié », demandes refusées (API 400) | OK (P0-05) |
| Mot de passe oublié | Réponse identique compte connu/inconnu ; notification Super Admin ; lien 1 h à usage unique ; agent → 403 | OK (P0-06) |
| Anti-spam | Honeypot → succès simulé, 0 ligne en base ; 6e requête/min → 429 | OK (P0-09) |
| Login | Compte inconnu vs mauvais mot de passe : même message, 431-462 ms | OK (P0-10) |
| En-têtes web | HSTS, X-Frame-Options, frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy ; image hôte inconnu → 400 | OK (P0-11) |
| Bail | Habitation avec 3 mois de caution → 400 explicite | OK (P0-13) |
| Paramètres | Ancien envoi (objet complet) → 400 (bug E-12 confirmé) ; nouvel envoi → 200 ; `/settings/public` sans auth | OK (P0-15) |
| Build | `next build` production | OK |
| Validation séjours (P0-18) | Création/auto-validation par un propriétaire → non publiée ; `javascript:` → 400 ; validation admin → publiée ; modification propriétaire → retirée | OK |
| Location (P1-01) | Publication agence → catalogue (25 champs publics) → demande de visite invitée → reçue côté agence ; coût d'entrée 420 000 FCFA affiché à 375 px | OK |
| Filtres (P1-02) | zone, budget, type, tri, pagination, meublé, quartier ; paramètre inconnu → 400 ; filtre via l'URL à 375 px | OK |
| SEO (P1-04) | Titre/description/canonical/JSON-LD dans le HTML serveur ; démo en `noindex` sans JSON-LD ; sitemap = pages fixes + annonces non démo | OK |
| Design (P1-06) | Polices Manrope/Fraunces réellement appliquées ; couleurs lagune/latérite ; recherche d'accueil → `/catalogue/locations?zone=Yopougon` | OK |
| Messages (T-11) | 401 « Connexion requise. », 403 « Cette action n'est pas autorisée pour votre profil. », 429 « Trop de tentatives… » | OK |
| Propriétaire (E-13) | Permissions renvoyées à la connexion ; bouton « Ajouter un bien » masqué sans `properties.manage` | OK (code + API ; écran non revu visuellement) |
| Build final | `next build` (2026-11-17 15:55) | OK |
| Tests unitaires API | 20/20 | OK |

## Lighthouse mobile sur la prod (2026-11-17, Lighthouse 12, simulation 4G lente)
| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP |
|---|---|---|---|---|---|
| Accueil | 73 | 97 | 100 | 100 | 4,3 s |
| Liste « Logements à louer » | 70 | 96 | 100 | 100 | 4,2 s |
| Fiche location (démo) | 63 | 96 | 100 | 91 | 5,4 s |
Constats et suites :
- Accessibilité : `aria-hidden-focus` venait de l'icône du logo rendue focusable par `whileTap` (Motion) → corrigé (`tabIndex={-1}`), à re-mesurer.
- SEO 91 sur la fiche : description absente pendant l'audit car l'API redémarrait après le déploiement (repli prévu sur un titre générique) ; revérifié ensuite : titre + description présents. C'est la limite du plan gratuit Render.
- Performance (LCP 4-5 s) : le contenu des annonces est chargé côté client après le JS (~200 Ko). Pistes : rendre la liste et la fiche côté serveur avec les données déjà lues pour le SEO, alléger Motion sur la vitrine, plan Render payant (pas de réveil). À traiter en P1 « performance ».

## Lighthouse « ordinateur » (2026-11-18, run Actions `44336732776`, cible `build` = `main` à `017048a`)
Lighthouse 12.8.2, preset desktop (écran 1350×940, RTT 40 ms, 10 Mbit/s, CPU ×1), machine Linux de GitHub (indice ≈ 2 470), médiane de 3 passages par page. Mesuré **avant** le lot sécurité (`1c9f6bc`). Rapports JSON conservés dans `_RESSOURCES/outils-session/lighthouse/44336732776/` (l'artefact GitHub expire le 2026-12-02) ; résumé : `node lh-summary.cjs <dossier>`.

| Page | Perf | Passages | A11y | BP | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|---|
| `/` | **100** | 99, 100, 100 | 100 | 96 | 100 | 0,26 s | 0,58 s | 0 ms | 0,000 |
| `/catalogue/locations` | **100** | 100, 100, 100 | 100 | 96 | 100 | 0,22 s | 0,58 s | 0 ms | 0,000 |
| `/catalogue/sales` | **100** | 100, 100, 100 | 100 | 96 | 100 | 0,22 s | 0,62 s | 0 ms | 0,000 |
| `/catalogue/locations/da2bc257…` | **100** | 100, 100, 100 | 100 | 96 | 66 | 0,22 s | 0,62 s | 0 ms | 0,001 |
| `/login` | **100** | 100, 100, 100 | 100 | 96 | 100 | 0,21 s | 0,60 s | 0 ms | 0,005 |
| `/securite` | **100** | 100, 100, 100 | 100 | 96 | 100 | 0,26 s | 0,54 s | 0 ms | 0,000 |

- Performance 100 sur les 6 pages ; aucune piste d'optimisation au-delà de 50 ms.
- Bonnes pratiques 96 partout = **artefact de la cible `build`** : le site servi sur `http://localhost:3000` appelle l'API de production, dont le CORS n'autorise que le site en ligne → `POST /api/analytics/pageview` (et `GET /api/settings/public` sur la fiche) bloqués, erreurs console. N'existe pas en production (origine autorisée). Pour un 100 en cible `build`, il faudrait une API de test qui autorise `localhost:3000`.
- SEO 66 sur la fiche `da2bc257…` = **voulu** : c'est une annonce de démonstration → `noindex, nofollow` (`apps/web/lib/listing-seo.tsx:106`). Pour mesurer le SEO d'une fiche, passer une annonce réelle dans l'entrée `paths`.
- Mobile (référence `14_CHECKLISTS.md` n° 10, médiane de 5) : accueil 97, connexion 96, CGU 98, locations 95, ventes 94, fiche 94 → l'objectif ≥ 96 reste à atteindre sur locations, ventes et fiche. L'ordinateur n'est pas le facteur limitant ; le mobile (CPU ×4, 4G lente) l'est.

## Contrôle CSP du lot sécurité (2026-11-18 soir, mini-PC, build de production local)
Contexte : branche `security/prelaunch` (lot non commité : CSP en production, `poweredByHeader: false`, case CGU, overrides npm). API locale :3101 sur Neon `audit-qa` (point d'accès `ep-curly-star-b1su9i1h`, réveillé par l'API au démarrage, vérifié avec l'outil Neon ; la prod n'est pas touchée) ; web `next start` :3100 construit avec `NEXT_PUBLIC_API_URL=http://localhost:3101`.
Méthode : Chrome 157 piloté par `puppeteer-core@24.43.1` ; écouteur `securitypolicyviolation` injecté avant tout script de chaque page ; défilement complet (cadres chargés à la demande) ; erreurs console et JS relevées. Sessions admin / propriétaire / locataire par les jetons de test de `outils-session` (re-signés pour 1 h avec le `JWT_SECRET` de test) : `GET /auth/me` = 200 pour les trois.
Preuves : `_RESSOURCES/outils-session/csp/` (`csp-report.json`, scripts, capture du formulaire).
- [x] En-tête envoyé : `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:3101 https://images.unsplash.com; font-src 'self'; connect-src 'self' http://localhost:3101; frame-src https:; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`
- [x] **0 violation sur 57 pages** : 21 publiques (accueil FR/EN, catalogue ×4, fiches location / courte durée / vente, connexion, inscription FR/EN, mot de passe oublié, vérification, sécurité, mentions légales, confidentialité, CGU, 404), 19 admin, 9 propriétaire, 9 locataire.
- [x] Carte OpenStreetMap (fiches courte durée et vente) et visite 360° Matterport (fiche vente) affichées ; tuiles 12/12 et 10/10 au second passage (le premier avait eu `ERR_NETWORK_CHANGED`, coupure réseau locale, sans lien avec la CSP). La fiche location testée n'a pas de coordonnées, donc pas de carte.
- [x] Service worker `sw.js` enregistré dans Chrome. Le navigateur intégré de l'application Claude refuse l'enregistrement (« unknown error when fetching the script ») : limite de ce navigateur, pas du site.
- [x] Case CGU obligatoire : `POST /auth/register` sans `acceptTerms` → 400 « Le champ « acceptTerms » est obligatoire. » ; `acceptTerms=false` → 400 « Acceptez les conditions générales… » ; formulaire à 390 px sans cocher → message d'erreur sous la case, `aria-invalid=true`, aucune requête envoyée.
- [x] Seule erreur console restante : le statut 404 de la page 404 (voulu).
- [ ] Constat UX, non corrigé (D-10, attend l'accord) : à 390 px, le bandeau de mesure d'audience recouvre le bouton « Créer mon compte » tant qu'il n'est pas fermé.
Rejouer : `outils-session/csp/run-api-qa.ps1` (refuse de démarrer si `DATABASE_URL` ne vise pas `audit-qa` ; dossier de travail sans `.env`, car **`apps/api/.env` vise la base de PRODUCTION**) ; installer `puppeteer-core@24.43.1 --ignore-scripts` dans un dossier d'outils et adapter le chemin du `require` en tête des scripts ; `node csp-check.cjs csp-report.json`.

## Contrôles en production après le déploiement du lot sécurité (2026-11-18, 23:55-00:00 UTC)
Commit `d3d00a9` ; Render `dep-dbv3l2d6e07s73aksc60` (API, live 23:55:13) puis `dep-dbv3m3mtlv9c73fn9900` (web, live 23:58:31). Aucune connexion avec un compte de test ; mesure d'audience refusée avant chaque page (0 page vue ajoutée).
- [x] API sur le nouveau code : `POST /api/auth/register` volontairement invalide (mot de passe « x », sans case) → 400 « Le mot de passe est trop court. / Le champ « acceptTerms » est obligatoire. » (aucun compte ne pouvait être créé) ; démarrage propre dans les journaux Render ; pas de `X-Powered-By`, `nosniff`, HSTS.
- [x] Site : en-tête CSP de prod = celle du dépôt avec `https://ivologis-api.onrender.com` et `upgrade-insecure-requests` ; `X-Frame-Options: DENY` ; pas de `X-Powered-By`.
- [x] **0 violation CSP sur 20 pages publiques** (Chrome 157, `outils-session/csp/csp-check-prod.cjs`, rapport `csp-report-prod.json`) ; cartes OpenStreetMap et visite Matterport affichées ; 0 envoi `/analytics`.
- [x] Lighthouse **mobile sur la prod** après déploiement (run Actions `44425634399`, cible `production`, Lighthouse 12.8.2, 4G lente simulée + CPU ×4, médiane de 5) : accueil **98** (91-100), locations **99** (90-100), fiche démo **99** (84-100), sécurité **97** (94-99), connexion **100** ; accessibilité 100 et bonnes pratiques **100** partout (le 96 de la cible `build` venait bien du CORS) ; SEO 100 sauf la fiche de démo (66, `noindex` voulu). Pages ventes / CGU non mesurées dans ce run. Rapports : `outils-session/lighthouse/44425634399/`.
- [x] Seules erreurs console : 404 de la page 404 (voulu) et une photo de démo supprimée par Unsplash (`photo-1500382017233-…` → 404 chez Unsplash même) sur une fiche vente de démo — disparaîtra avec le retrait des données de démo.

## Déploiement du retrait de `zod` (2026-11-19, 00:17-00:21 UTC)
Commit `8f95d7f` (`main` en avance rapide depuis `5233399`) ; Render web seulement `dep-dbv40au7bikc73fgo8g0` (live 00:19:43, « Ready in 3.2s ») ; API non concernée.
- [x] 0 violation CSP sur les 20 pages publiques de la prod, en-têtes identiques, 0 envoi `/analytics` (`outils-session/csp/csp-report-prod-zod.json`).
- [x] Journaux Render : démarrage propre. Deux messages antérieurs à ce lot : photo Unsplash de démo supprimée (déjà notée) ; avertissement Next.js « `metadataBase` not set … using http://localhost:10000 » émis par une route hors de `app/[lang]/layout.tsx` — **sans effet visible** : les pages servent `og:image` = `https://ivologis-web.onrender.com/opengraph-image?…` (vérifié sur 6 pages). Correctif possible : `metadataBase` aussi dans `app/layout.tsx`.
- [x] Constat SEO : `og:url` des pages catalogue / sécurité / connexion = l'accueil au lieu de l'adresse de la page (et titre d'aperçu = celui de l'accueil). **Corrigé le 2026-11-19 (branche `fix/p1-04-og-url`, local, non déployé)** : `lib/page-meta.ts` (`pageMetadata`) sur les 9 pages publiques + gabarits `layout.tsx` pour les 4 pages de connexion (textes dans `messages/auth-meta.ts`). Vérifié sur le build local, FR et EN (`outils-session/csp/og-check.cjs`) : 14 pages × 2 langues → `og:url` et adresse canonique = la page, titre et description de la page (Open Graph et X), `og:locale` `fr_CI` / `en_GB`, `og:site_name`, image d'aperçu 1200×630 (Open Graph et X) ; accueil inchangé ; onglet « Connexion · IVOLOGIS » au lieu du titre générique. `tsc`, `check:i18n` (« Bilingue complet »), `build:web` verts ; JS partagé 103 kB inchangé ; pages de connexion toujours pré-générées.
- [ ] Reste (antérieur, non modifié) : une fiche sans photo n'a pas d'image d'aperçu (pas d'image de repli dans `listingMetadata`) ; `twitter:title` des fiches = « IVOLOGIS » ; pas de `og:locale` / `og:site_name` sur les fiches.

## À vérifier après déploiement en prod
- [x] Migrations appliquées (6 migrations du 2026-11-17, vérifié par SQL en lecture)
- [ ] IP réelle affichée dans Profil → Sessions (S-07) — à faire par l'utilisateur connecté
- [x] Les 6 annonces fictives affichent « Démo » (catalogue prod : `isDemo=true`)
- [ ] Connexion impossible avec les anciens mots de passe publiés (après rotation par l'utilisateur)

## Parcours par rôle (Phase 8)
- [ ] Visiteur : vitrine → catalogue vente → fiche → demande de visite (invité) → référence affichée
- [ ] Visiteur : catalogue courte durée → fiche → calendrier → demande de réservation
- [ ] Locataire : inscription avec code → tableau de bord → déclaration de paiement → quittance après confirmation → maintenance
- [ ] Propriétaire : biens → mise en vente → demandes de visite → relevé
- [ ] Agent/Admin : code d'invitation, confirmation de paiement, vérification titre foncier, documents de vente, paramètres légaux
- [ ] Petit écran (360 px) et connexion lente (3G simulée)

## Sécurité
- [ ] Points CRITIQUE/ÉLEVÉ de `07_SECURITE.md` CORRIGÉS ou ACCEPTÉS par écrit (reste : S-01 rotation, S-06 2FA, S-08 cookie httpOnly)

## Relecture légale
- [ ] Textes marqués « À VÉRIFIER PAR UN JURISTE » (`02_MARCHE_CI_AFRIQUE.md`) relus ; politique de confidentialité et mentions légales validées
