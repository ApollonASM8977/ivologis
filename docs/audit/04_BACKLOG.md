# 04 — Backlog priorisé

Statuts : TODO · EN COURS · FAIT · BLOQUÉ (raison). Priorités : **P0** (sécurité, bloquant, confiance, légal minimal) · **P1** (fort impact) · **P2** (différenciant). Effort : S (< 2 h) · M (demi-journée) · L (≥ 1 jour).
Une tâche = un commit `type(ID): ...`. Chaque tâche se vérifie sur l'environnement local branché sur la branche Neon `audit-qa` (voir HANDOFF). Références : `S-xx` sécurité, `E/T/D/P-xx` gap partie 1, `R-xx` exigences marché.

## Jalons
1. **Jalon 1 — MVP solide** : tous les P0 + P1-01 à P1-06. Condition de mise en production publique.
2. **Jalon 2 — Version marché CI** : paiement réel, email/SMS, stockage objet, SEO local (pages communes), refonte design (Phase 7), vérification foncière documentée, relances automatiques.
3. **Jalon 3 — Version panafricaine** : configuration multi-pays (devise, règles légales, paiements, langues), multi-agences.

## P0
| ID | Titre | Effort | Statut | Fichiers | Critères d'acceptation |
|---|---|---|---|---|---|
| P0-01 | Inscription : supprimer le rattachement par téléphone, rattachement par **code d'invitation** (S-02) | M | FAIT (2026-11-17) | `schema.prisma` (Owner/Tenant `inviteCodeHash` HMAC, `inviteExpiresAt`), migration `20261117120000_invite_codes`, `common/utils/invite-code.util.ts`, `components/invite-code-card.tsx`, `auth.service.ts`, `register.dto.ts`, `tenants/owners` controller+service (génération), `app/register/page.tsx`, fiches locataire/propriétaire admin | 1) S'inscrire avec le téléphone d'un dossier existant **sans code** ne donne accès à aucune donnée (locataire : refus ; propriétaire : nouveau dossier vide). 2) L'agence génère un code (8 caractères, valable 7 jours, usage unique) depuis la fiche. 3) Avec code + même téléphone → compte rattaché ; code réutilisé ou expiré → refus. 4) Test unitaire du contrôle de code. |
| P0-02 | Paiement locataire = **déclaration** (PENDING + référence obligatoire), quittance seulement après confirmation agence ; `confirmPayment` refuse les statuts non en attente (S-03, S-13) | S | TODO | `payments.service.ts`, `pay-rent.dto.ts`, `app/tenant/payments/page.tsx`, page admin paiements | 1) `POST /payments/pay-rent` → `status=PENDING`, pas de reçu, `transactionRef` requis. 2) L'admin confirme → PAID + quittance + notification. 3) Confirmer un paiement PAID/CANCELLED → 400. 4) Texte locataire honnête (« votre paiement sera confirmé par l'agence »). |
| P0-03 | Catalogue public : liste blanche de champs, exclure vendus/archivés, masquer l'identité du propriétaire (S-04) | S | TODO | `catalog.service.ts`, `sale-listing-detail.tsx` | 1) `GET /catalog/*` ne renvoie aucun champ `sale*` interne, `ownerId`, `currentTenantId`, `rentAmount` (vente), `owner`. 2) Bien vendu ou archivé → 404 public. 3) Fiche publique sans nom du propriétaire. |
| P0-04 | Documents de vente et reçus de séjour ouvrables (URL signée) (E-02) | S | TODO | `storage.service.ts` | 1) Admin/agent et propriétaire du bien ouvrent un document de vente et un reçu de séjour. 2) Un autre propriétaire → 403. 3) Test unitaire d'autorisation si possible. |
| P0-05 | Données de démo **clairement identifiées** : champ `isDemo`, bandeau « Annonce de démonstration — bien fictif », pas de badge « Titre vérifié » ni de texte « vérifié par notre agence » sur une démo (T-01, R-05) | S | TODO | `schema.prisma`, migration, `catalog.service.ts`, fiches/cartes catalogue, formulaire bien (case admin) | 1) Les 6 annonces fictives affichent « Démo » sur carte et fiche. 2) Aucune démo n'affiche « vérifié ». 3) Le marquage est modifiable par l'admin. |
| P0-06 | « Mot de passe oublié » honnête + **réinitialisation assistée par l'admin** (lien à usage unique à transmettre) (S-05, E-03) | S | TODO | `auth.service.ts`, `users.controller.ts`, `forgot-password/page.tsx`, page équipe/utilisateurs | 1) La page n'affirme plus qu'un email est envoyé si aucun fournisseur n'est configuré. 2) Le Super Admin génère un lien de réinitialisation (1 h, invalidé après usage) pour un utilisateur. 3) Audit log de l'action. |
| P0-07 | `trust proxy` derrière Render (S-07) | S | TODO | `main.ts` | `app.set("trust proxy", 1)` ; IP réelle dans sessions/audit (à confirmer en prod). |
| P0-08 | Retirer les identifiants du README, mots de passe du seed via variables d'environnement (S-01 partie code) | S | TODO | `README.md`, `prisma/seed.ts` | 1) Aucun mot de passe dans le dépôt (grep). 2) Seed refuse de tourner sans `SEED_PASSWORD` en production. |
| P0-09 | Limitation stricte + honeypot sur les formulaires publics (S-11) | S | TODO | `sales.controller.ts`, `short-stay.controller.ts`, `contact.controller.ts`, DTO, formulaires web | 1) > 5 demandes/min/IP → 429. 2) Champ piège rempli → requête ignorée sans erreur visible. |
| P0-10 | Login sans énumération de comptes (S-12) | S | TODO | `auth.service.ts` | Même message et temps comparable pour compte inexistant / mauvais mot de passe / compte suspendu (statut révélé seulement après mot de passe correct). |
| P0-11 | En-têtes de sécurité web + hôtes d'images restreints (S-09, S-10) | S | TODO | `next.config.js` | 1) `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy` présents. 2) `/_next/image` refuse un hôte non listé. |
| P0-12 | Retirer les affirmations fausses ou non sourcées (« Le plus choisi », « rappels automatiques », « mots de passe chiffrés », « 4 % », « Art. 1143 CGI », « chaque bien vérifié ») (T-04, T-08, E-04, R-13) | S | TODO | `(marketing)/page.tsx`, `sale-listing-detail.tsx`, `lease-form.tsx`, `securite/page.tsx` | grep : aucune de ces formulations ; textes remplacés par des formulations vraies et sourcées dans `02`. |
| P0-13 | Plafond légal bail d'habitation **appliqué côté serveur** (caution ≤ 2 mois, avance ≤ 2 mois) (R-02) | S | TODO | `leases.service.ts`, `lease-form.tsx` | 1) Bail HABITATION_NUE/MEUBLEE avec caution > 2× loyer → 400 explicite. 2) Bail commercial/professionnel non concerné. 3) Message web aligné. |
| P0-14 | Référentiel géographique : 13 communes du District + champ **quartier** ; corriger Riviera/Assinie (T-03, R-03) | M | TODO | `packages/shared/src/constants.ts`, `schema.prisma` (`neighborhood`), migration de données, formulaire bien, catalogue | 1) Liste = 13 communes officielles + autres villes (dont Grand-Bassam, Assinie). 2) Bien « Riviera » → commune Cocody, quartier Riviera. 3) Le quartier s'affiche sur cartes et fiches. |
| P0-15 | Identité légale de l'agence paramétrable (raison sociale, RCCM, n° d'agrément, n° ARTCI, WhatsApp) et utilisée dans mentions légales, pied de page, baux, quittances — plus aucun « [à compléter] » visible (T-07, R-09) | M | TODO | `schema.prisma` (CompanySettings), settings DTO/page, `mentions-legales`, `confidentialite`, `site-footer`, PDF | 1) Champs éditables par le Super Admin. 2) Champ vide → ligne masquée (jamais « [à compléter] »). 3) Confidentialité : données des invités, cookies, hébergement hors CI, droit de suppression. Contenu final ⚖️ juriste. |
| P0-16 | 2FA obligatoire pour les comptes internes (S-06) | S | **BLOQUÉ** (décision utilisateur D-03) | `auth.service.ts` | `ENFORCE_MANDATORY_2FA = true` après accord. |
| P0-17 | Rotation des mots de passe des comptes du seed en prod (S-01) | — | **BLOQUÉ** (action utilisateur) | — | Connexion avec les anciens mots de passe impossible. |

## P1
| ID | Titre | Effort | Statut | Critères d'acceptation (résumé) |
|---|---|---|---|---|
| P1-01 | **Location longue durée** dans le catalogue public (biens vacants publiés) + coût d'entrée détaillé (1er loyer + avance + caution + ½ frais d'agence) + demande de visite (R-01) | M | TODO | Onglet « Louer » ; fiche avec récapitulatif chiffré en FCFA ; demande de visite invitée avec référence. |
| P1-02 | Recherche et filtres catalogue (commune, quartier, type, budget, pièces, meublé), tri, pagination | M | TODO | Filtres dans l'URL (partageables), résultats < 1 s sur la base de test. |
| P1-03 | Contact en 2 taps vers l'agence (WhatsApp prérempli avec la référence de l'annonce + appel) (R-07) | S | TODO | Boutons visibles sans défiler sur mobile ; numéro = paramètres agence ; jamais le propriétaire. |
| P1-04 | SEO : pages annonces rendues côté serveur, `generateMetadata`, schema.org `RealEstateListing`, sitemap dynamique (P-01, R-11) | M | TODO | HTML initial contient titre, prix, commune ; sitemap liste les annonces publiées. |
| P1-05 | Bloc anti-arnaque sur les annonces + page « Comment on vérifie les annonces » (R-06) | S | TODO | Présent sur chaque fiche ; page liée depuis le footer. |
| P1-06 | Vitrine : double entrée claire « Trouver un bien » / « Confier ou gérer mes biens » ; premier écran mobile utile (P-05, E-10) | M | TODO | Recherche visible au premier écran 375 px. |
| P1-07 | Suivi public d'une demande par référence + téléphone | S | TODO | Page `/suivi` : statut de la demande sans compte. |
| P1-08 | Types de biens et équipements ivoiriens (R-04, T-06) | S | TODO | Cour commune, chambre-salon, duplex, entrepôt ; compteurs CIE/SODECI, bâche à eau… |
| P1-09 | Vérification foncière documentée (date, vérificateur, pièce archivée, historique) | M | TODO | Badge « Vérifié le JJ/MM/AAAA » ; retrait auto si document supprimé. |
| P1-10 | Email transactionnel (Brevo/Resend) : réinitialisation, accusé de demande | M | **BLOQUÉ** (clé API utilisateur) | — |
| P1-11 | Paiement réel CinetPay (webhook signé, idempotent, vérification serveur) (R-08) | L | **BLOQUÉ** (compte marchand) | — |
| P1-12 | Stockage objet (Cloudflare R2/S3) + compression d'images à l'upload + vérification des octets magiques (D-01, P-03, S-14) | M | **BLOQUÉ** (compte de stockage) | — |
| P1-13 | Jeton en cookie `httpOnly` (S-08) | L | TODO (après domaine personnalisé idéalement) | — |
| P1-14 | Tests web (parcours catalogue) + `next lint` en CI (D-03) | M | TODO | CI rouge si un parcours casse. |
| P1-15 | Branche Neon de développement pour le `.env` local (D-05) | S | TODO | Le dev local n'écrit plus en prod. |
| P1-16 | Relances automatiques de loyers (planificateur) (E-04) | M | TODO | Notification J+5 d'impayé, journalisée. |
| P1-17 | Modération : file « annonces à vérifier » pour l'admin | S | TODO | — |

## P2
| ID | Titre | Effort |
|---|---|---|
| P2-01 | Favoris, filtres sauvegardés, alertes | M |
| P2-02 | Carte interactive des résultats | M |
| P2-03 | Simulateur de crédit et de rentabilité | S |
| P2-04 | Comparateur de biens | M |
| P2-05 | Messagerie interne agence ↔ client | L |
| P2-06 | Avis vérifiés après séjour / bail | M |
| P2-07 | Visite virtuelle native (voir étude 3D, projet séparé) | L |
| P2-08 | Configuration multi-pays (Country/City/Quartier, devise, règles légales, paiements) | L |
| P2-09 | Multi-agences (si décision SaaS, E-10), abonnements et mises en avant | L |
| P2-10 | Signature électronique (prestataire agréé ARTCI) | L |
| P2-11 | Assistant IA (rédaction d'annonces, réponses FAQ) | M |
| P2-12 | Dark mode | S |
