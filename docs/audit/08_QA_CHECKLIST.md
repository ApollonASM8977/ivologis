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
