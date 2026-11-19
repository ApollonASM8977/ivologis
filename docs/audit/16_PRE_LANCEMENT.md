# 16 — Revue d'avant lancement (2026-11-18)

**Objet** : dire, preuves à l'appui, ce qui est prêt pour une vraie mise en production d'IVOLOGIS, ce qui a été corrigé aujourd'hui et ce qui manque.
**Code examiné** : branche `security/prelaunch` — `1c9f6bc` (lot sécurité), `9783d01` et `e7d1ca7` (traces). **Non poussé, non déployé.** Production actuelle : `a064c72` (Render).
**Où** : mini-PC (`D:\My Project\IMMO+`), API locale :3101 sur la branche Neon `audit-qa` (jamais la prod), site `next start` :3100 (build de production).
**Légende** : ✅ vérifié avec preuve · 🟡 fait, une action reste · ❌ manquant · ⚖️ à vérifier par un juriste · « NON VÉRIFIÉ » = pas contrôlé dans cette revue.

## 1. Sources (consultées le 2026-11-18)

| Référentiel | Lien | Usage ici |
|---|---|---|
| OWASP Top 10:2025 | [owasp.org/Top10/2025](https://owasp.org/Top10/2025/0x00_2025-Introduction/) | Grille des 10 risques (§ 3) |
| OWASP ASVS 5.0 (17 chapitres) | [github.com/OWASP/ASVS](https://github.com/OWASP/ASVS) · [index des cheat sheets ASVS](https://cheatsheetseries.owasp.org/IndexASVS.html) | Chapitres principaux (§ 4). Les numéros d'exigences ne sont pas cités : les sources tierces se contredisent sur leur décompte. |
| Checklist de production Next.js | [nextjs.org/docs/app/guides/production-checklist](https://nextjs.org/docs/app/guides/production-checklist) | § 5 |
| Loi ivoirienne n° 2013-450 du 19/06/2013 (données personnelles), autorité ARTCI | Texte au Journal officiel : [anac.ci (PDF)](https://cms21.anac.ci/uploads/748534/LOI_2013-450.pdf) · [NATLEX](https://natlex.ilo.org/dyn/natlex2/r/natlex/fe/details?p3_isn=104182) · presse : [CIO Mag](https://cio-mag.com/cote-divoire-artci-le-traitement-des-donnees-personnelles-desormais-soumis-a-une-autorisation-prealable) | § 6 ; détail et autres textes dans `02_MARCHE_CI_AFRIQUE.md` |

## 2. Vérifié aujourd'hui, avec preuve (sur le code commité)

| Contrôle | Résultat | Preuve |
|---|---|---|
| Types (API + web), builds (partagé, API, web) | ✅ code 0 | `tsc --noEmit`, `npm run build:*` |
| Tests unitaires API | ✅ **28/28** | `npm run test --workspace=@ivologis/api` |
| Traductions | ✅ | `npm run check:i18n` (2 avertissements anciens hors lot : `short-stay-listing-detail.tsx:103`, `lease-form.tsx:178`) |
| Suite sécurité par rôle | ✅ **41/41** | `apps/api/test/qa-securite.mjs` sur `audit-qa` : jetons falsifiés / « none » → 401, 18 accès interdits par rôle → 403, isolation propriétaire/locataire, coordonnées masquées, injection SQL, pagination démesurée, élévation de rôle, CORS tiers refusé, `nosniff`, pas de `X-Powered-By` |
| Preuve A/B (appartenance) | ✅ **16/16 refusées** | `apps/api/test/qa-ab.mjs` : comptes B créés par le vrai parcours d'invitation ; lire / modifier / supprimer / commenter les données de A → 403/404 ; A lit les siennes → 200 |
| CSP dans un vrai navigateur | ✅ **0 violation sur 57 pages** | Chrome 157 : 21 pages publiques + 19 admin + 9 propriétaire + 9 locataire (`08_QA_CHECKLIST.md`) ; carte OpenStreetMap et visite 360° affichées |
| Case CGU obligatoire | ✅ | API : sans case → 400, case `false` → 400 ; formulaire : message sous la case, `aria-invalid`, aucune requête envoyée ; journal d'audit : `termsAcceptedAt` + `termsVersion` |
| Scanner Wapiti 3.2.3 (modules passifs `csp`, `http_headers`, `cookieflags`, site local) | ✅ CSP présente (avant : seul constat « CSP absente ») | `_RESSOURCES/outils-session/csp/wapiti-headers.json` ; restent 2 remarques faibles (§ 8 : `unsafe-inline`, cookie de langue) |
| Dépendances (`npm audit`) | 🟡 exécution : **5** (4 modérées, 1 élevée, 0 critique) ; total avec outils de développement : 18 | détail § 8 (S-15) |
| Vitesse | ✅ ordinateur 100 · 🟡 mobile 94-98 | § 9 |

## 3. OWASP Top 10:2025 → IVOLOGIS

| Risque | État | Preuve / reste |
|---|---|---|
| A01 Contrôle d'accès défaillant | ✅ | 141 routes auditées (`15_ROUTES.md`), A/B 16/16, 41/41 ; S-02 (rattachement par téléphone) et S-04 (fuite du catalogue) corrigés |
| A02 Mauvaise configuration de sécurité | 🟡 | CSP stricte en production, HSTS, `X-Frame-Options`, `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Powered-By` retiré, `helmet` côté API, CORS limité. Reste : 2FA obligatoire désactivée (S-06), `JWT_SECRET` de Render à confirmer, `script-src 'unsafe-inline'` |
| A03 Défaillances de la chaîne d'approvisionnement logicielle | 🟡 | Overrides npm (multer, body-parser, qs, lodash, postcss), `uuid` inutilisé retiré ; restaient 5 alertes d'exécution ; après retrait de `zod` (branche `fix/s15-retirer-zod`) : 4 modérées, 0 élevée (NestJS 10 → 12). Dependabot désactivé sur GitHub |
| A04 Défaillances cryptographiques | 🟡 | bcrypt 12 tours, HTTPS forcé, URL de documents signées HMAC 10 min, codes d'invitation en HMAC. Reste : pièces d'identité non chiffrées en base, images privées non signées (S-17) |
| A05 Injection | ✅ | Prisma paramétré (test d'injection SQL OK), React échappe tout ; un seul `dangerouslySetInnerHTML` : JSON-LD avec `<` échappé (`lib/listing-seo.tsx:129`) ; CSP en défense supplémentaire |
| A06 Conception non sécurisée | 🟡 | Paiement déclaratif + confirmation agence (S-03), validation agence des annonces (S-16), règles légales CI en code testé. Reste : pas de test de charge ni d'intrusion externe |
| A07 Défaillances d'authentification | 🟡 | 5 connexions/min/IP, réponse identique compte inconnu / mauvais mot de passe (S-12), sessions révocables, 2FA TOTP disponible. **Reste P0 : mots de passe des comptes de test en prod (S-01), 2FA obligatoire (S-06)** ; P1 : jeton lisible par JavaScript (S-08), mots de passe déjà fuités acceptés, inscription qui révèle un e-mail existant |
| A08 Défaillances d'intégrité des logiciels ou des données | 🟡 | `package-lock.json` + `npm ci` ; faux fichiers image rejetés (contenu vérifié). Pas de webhook de paiement (rien à signer aujourd'hui) |
| A09 Défaillances de journalisation et d'alerte | 🟡 | Journal d'audit (connexion, inscription avec CGU, actions agence). **Manque** : supervision et alertes (aucun suivi d'erreurs ni alerte en cas de panne) |
| A10 Mauvaise gestion des situations exceptionnelles | ✅ | Filtre d'exceptions : message neutre au navigateur, détail côté serveur (S-20) ; page d'erreur globale (`app/global-error.tsx`) et 404 bilingue |

## 4. ASVS 5.0 (chapitres principaux) → IVOLOGIS

| Chapitre | État | Remarque |
|---|---|---|
| V1 Encodage et assainissement | ✅ | Voir A05 |
| V2 Validation et logique métier | ✅ | `ValidationPipe` `whitelist` + `forbidNonWhitelisted` (champ inconnu → 400), caution / avance ≤ 2 mois (`lease-rules.ts`) |
| V3 Sécurité du frontal web | 🟡 | En-têtes et CSP OK ; cookie de session et cookie de langue posés par JavaScript sans `HttpOnly` (S-08, S-22) |
| V5 Gestion des fichiers | 🟡 | Contenu des images vérifié, GPS retiré, taille réduite ; stockage en base (S-14), images privées non signées (S-17) |
| V6 Authentification | 🟡 | Voir A07 |
| V7 Gestion des sessions | 🟡 | Sessions révocables (`Session` + `tokenVersion`), fermeture de toutes les sessions ; jeton 7 jours lisible par JavaScript (S-08) |
| V8 Autorisation | ✅ | Voir A01 |
| V13 Configuration | 🟡 | Secrets uniquement en variables d'environnement, `.env` hors git ; **le `.env` local de l'API vise la base de production (S-23)** |
| V14 Protection des données | 🟡 | Coordonnées masquées entre propriétaire et locataire (prouvé) ; pièces d'identité non chiffrées ; durée de conservation non définie |
| V16 Journalisation et gestion des erreurs | 🟡 | Voir A09 et A10 |

## 5. Checklist de production Next.js

| Point | État | Preuve |
|---|---|---|
| Limites `"use client"` (petit JS envoyé) | ✅ | Pages publiques en composants serveur + îlots ; 103 kB de JS partagé (sortie de `next build`) |
| Données côté serveur, pas de cascade | ✅ | Catalogue et fiches rendus côté serveur (lot P) |
| Écrans d'erreur et 404 | ✅ | `app/global-error.tsx`, `app/[lang]/not-found.tsx`, `[...missing]` |
| Métadonnées et SEO | ✅ | Titre, description, Open Graph, `sitemap.xml`, `robots.txt` ; annonces de démo en `noindex` (voulu) |
| Sécurité : autorisation dans chaque Server Action | ➖ | Aucune Server Action (`"use server"` absent) : toute écriture passe par l'API NestJS, contrôlée route par route |
| Secrets : `.env*` hors git, seules les `NEXT_PUBLIC_*` atteignent le navigateur | ✅ | `.gitignore` ; seuls des `.env.example` sont suivis ; navigateur : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` |
| Politique de sécurité du contenu (CSP) | ✅ | Ce lot (§ 2) |
| Types | ✅ | `tsc --noEmit` web et API |
| Signaux web essentiels | 🟡 | § 9 |
| Analyse du poids des paquets JavaScript | NON VÉRIFIÉ | Pas d'analyse `@next/bundle-analyzer` dans cette revue |

## 6. Loi 2013-450 / ARTCI

| Obligation | État | Remarque |
|---|---|---|
| Autorisation préalable du traitement par l'ARTCI | ❌ | Démarche de l'agence (utilisateur). Source : CIO Mag, `02_MARCHE` |
| Transfert vers un pays tiers : serveurs à Francfort (Render) et `eu-central-1` (Neon) | ❌ ⚖️ | Le texte définit « pays tiers » comme tout État **non membre de la CEDEAO** : l'Allemagne en est un. Régime exact du transfert (autorisation de l'ARTCI selon des sources secondaires) **À VÉRIFIER PAR UN JURISTE** sur le texte officiel |
| Information des personnes | 🟡 ⚖️ | Politique de confidentialité FR/EN en ligne (`/confidentialite`) ; validation par un juriste à faire |
| Consentement / acceptation des conditions | ✅ (nouveau) | Case CGU obligatoire, date et version des textes au journal d'audit (`TERMS_VERSION = 2026-11-18`) |
| Mentions légales complètes (RCCM, agrément, n° ARTCI) | 🟡 | Structure prête, valeurs `[à compléter]` (Paramètres) |
| Sécurité des données | 🟡 | § 3 et § 4 |
| Droits des personnes (accès, rectification, suppression) et durée de conservation | NON VÉRIFIÉ | Parcours de suppression de compte et durées de conservation à définir et tester |

## 7. Corrigé aujourd'hui (lot `security/prelaunch`, à déployer)
- **S-09** : CSP stricte en production (`apps/web/next.config.js`) — `default-src 'self'`, scripts et styles du site seulement, images du site / de l'API / Unsplash (démo), appels réseau vers l'API seulement, cadres https (carte, visite 360°), `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests` quand l'API est en https. `poweredByHeader: false`.
- **CGU** : case obligatoire à l'inscription (formulaire + DTO `@Equals(true)`), preuve d'acceptation au journal (date + version), traductions FR/EN.
- **S-15 (partiel)** : `overrides` npm `multer 2.5.0`, `body-parser 1.20.9`, `qs 6.17.1`, `lodash 4.18.1`, `postcss 8.5.33` ; dépendance `uuid` inutilisée retirée de l'API.

## 8. Manquant pour la vraie production

**P0 — bloquant avant d'ouvrir au public**
| # | Point | Qui | Réf. |
|---|---|---|---|
| 1 | Changer les mots de passe des comptes de test présents en prod (dont un SUPER_ADMIN sans 2FA) | Utilisateur | S-01, D-06 |
| 2 | Rendre la 2FA obligatoire pour les comptes internes (`ENFORCE_MANDATORY_2FA=false` aujourd'hui) | Code + utilisateur | S-06, P0-16 |
| 3 | Vérifier que le `JWT_SECRET` de Render n'est pas la valeur d'exemple | Utilisateur | C2-1 |
| 4 | Hébergement payant : Render gratuit endort le site (~50 s au premier visiteur), Neon gratuit 1 Go | Utilisateur (achat) | `09_FOURNISSEURS.md` |
| 5 | Domaine propre + cookie de session `httpOnly` (aujourd'hui lisible par JavaScript) | Utilisateur (domaine) + code | S-08 |
| 6 | Autorisation ARTCI du traitement et du transfert hors CEDEAO | Utilisateur ⚖️ | § 6 |
| 7 | CGU et politique de confidentialité validées par un juriste | Utilisateur ⚖️ | C1-2 |
| 8 | Sauvegardes : 6 h de restauration à un instant donné seulement (plan gratuit) ; test de restauration jamais fait | Utilisateur + code | `docs/PROCEDURE-SAUVEGARDE.md` |
| 9 | Supervision et suivi d'erreurs (alerte en cas de panne) | Code + choix d'outil | A09 |
| 10 | Retirer les données et images de démonstration ; créer les vrais comptes, supprimer ceux de test | Utilisateur + code | P0-17, D-06 |

**P1 — à faire vite après l'ouverture (ou avant si possible)**
- ✅ **`zod` retiré de `apps/web/package.json`** (2026-11-19, branche `fix/s15-retirer-zod`, **non déployé**) : importé nulle part ; `npm ls zod` vide ; dépendances d'exécution **4 modérées, 0 élevée** (GHSA-mrhx-c7xc-m3w5 disparue) ; lock : 11 lignes retirées, binaires Linux / Windows / macOS intacts (16 / 5 / 6) ; `tsc`, `check:i18n`, `build:web` verts (S-15).
- Passage à NestJS 12 : seul correctif proposé pour `@nestjs/core` (GHSA-36xv-jgw5-4q75) et `@nestjs/platform-express` ; `@nestjs/common` et `file-type` (GHSA-5v7r-6r5c-r473) ont un correctif sans changement de version majeure (`npm audit fix`, à tester) (S-15).
- **`.env` local de l'API = base de production** (S-23) : le pointer vers `audit-qa` (ou une branche de développement) ; garder les accès prod hors du poste.
- Fournisseur d'e-mails (réinitialisation de mot de passe aujourd'hui par l'agence) — P1-10.
- Test de charge ; tests sur vrais téléphones ; environnement de préproduction.
- Stockage objet pour les fichiers (aujourd'hui en base) et signature des images privées (S-14, S-17).
- `security.txt`, Google Search Console, Dependabot activé.
- Refuser les mots de passe déjà fuités ; inscription qui révèle si un e-mail existe déjà.
- À 390 px, le bandeau de mesure d'audience recouvre le bouton « Créer mon compte » tant qu'il n'est pas fermé (D-10 : accord de l'utilisateur avant de toucher à l'interface).

**P2**
- CSP : passer `script-src 'unsafe-inline'` à un nonce (Next.js insère ses données en ligne ; compromis commenté dans `next.config.js`).
- Cookie de langue `ivologis_lang` sans attribut `Secure` en https (S-22, valeur non sensible).
- Animations de la branche `preview/animations` (attend la validation, D-10) ; cache CDN (accueil en `private, no-store`) ; test d'intrusion externe.

## 9. Performance

| Page | Mobile (Linux, médiane de 5, `14_CHECKLISTS.md`) | Ordinateur (Linux, médiane de 3, run `44336732776`) |
|---|---|---|
| Accueil | 97 | 100 |
| Connexion | 96 | 100 |
| CGU | 98 | — |
| Locations | **95** | 100 |
| Ventes | **94** | 100 |
| Fiche | **94** | 100 |
| Sécurité | — | 100 |

**Mise à jour après déploiement — mobile sur la prod** (run `44425634399`, 2026-11-19 00:02 UTC, médiane de 5) : accueil **98**, locations **99**, fiche **99**, sécurité **97**, connexion **100** ; bonnes pratiques 100 partout. Les 5 pages mesurées atteignent l'objectif ≥ 96 en production ; les écarts entre passages restent grands (84 à 100) : se fier aux médianes. Ventes et CGU non mesurées dans ce run.
Mesure de la version du dépôt (colonne mobile ci-dessus, avant ce lot) : objectif ≥ 96 non atteint pour locations, ventes et fiche (prochain levier : filtres traités par le serveur sans React Query). 100 sur mobile n'est pas atteignable avec Next.js/React (~103 kB de JS partagé sous la simulation Lantern). En production, le plan gratuit Render ajoute ~50 s au premier visiteur après une mise en veille : c'est le premier problème de vitesse réel.

## 10. Déploiement (accord de l'utilisateur le 2026-11-18)
**Fait** : `main` avancé en avance rapide de `017048a` à `d3d00a9` ; Render API `dep-dbv3l2d6e07s73aksc60` (live 23:55 UTC) puis web `dep-dbv3m3mtlv9c73fn9900` (live 23:58 UTC). Aucune migration. Contrôles en prod (`08_QA_CHECKLIST.md`) : nouveau code de l'API confirmé, en-têtes et CSP en place, **0 violation CSP sur 20 pages publiques**.
À noter : les services Render affichent « déploiement automatique : oui » mais le push sur `main` n'a déclenché aucun déploiement (ni pour `017048a` ni pour `d3d00a9`) → déclenchement manuel (`trigger_deploy`) toujours nécessaire ; le lien GitHub ↔ Render est à vérifier dans le tableau de bord Render.
