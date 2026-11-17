# 03 — Gap analysis

Partie 1 (Existant) : Phase 1, 2026-11-17 — lecture du code + tests sur l'API/le web locaux branchés sur la branche Neon `audit-qa` (copie de la prod).
Partie 2 (écarts vs niveau expert, croisée avec la Phase 2) : Phase 3.
Notation : **criticité 1 (faible) à 5 (bloquant)** · **effort S/M/L** · impact : U = utilisateur, C = confiance, L = légal, R = revenu.

## Partie 1 — Existant

### a) Fonctionnalités factices ou incomplètes
| ID | Constat | Preuve | Crit. | Effort | Impact |
|---|---|---|---|---|---|
| E-01 | **Paiement du loyer simulé** : « Payer maintenant » (locataire) marque PAYÉ + quittance sans encaissement (voir S-03). La page affiche bien « paiement simulé pour la démonstration » mais la quittance, elle, est officielle. | test API + `/tenant/payments` | 5 | M | C, L, R |
| E-02 | **Documents de vente et reçus de séjour impossibles à ouvrir** : `/files/sign` ne connaît que baux, quittances et pièces jointes de demandes → « Document introuvable ». Concerne `PropertySaleDocument`, `Property.saleDocumentUrl`, `ShortStayBooking.receiptUrl`. | test API (upload PDF puis `POST /files/sign` → 404) ; `storage.service.ts` | 4 | S | U, C |
| E-03 | **« Mot de passe oublié » n'envoie rien en prod** (aucun fournisseur email/SMS), message mensonger « un lien a été envoyé » (S-05). | `auth.service.ts` | 4 | S (palliatif) / M (email) | U |
| E-04 | **« Rappels automatiques »** annoncés sur la vitrine : n'existent pas (seulement un bouton de relance manuelle qui crée une notification in-app ; aucun planificateur). | `page.tsx` FEATURES ; aucune dépendance `@nestjs/schedule` | 3 | M | C |
| E-05 | Notifications **in-app uniquement** : pas d'email, SMS ni WhatsApp alors que les enums existent. Un invité qui fait une demande de visite n'est jamais prévenu de la réponse. | `notifications.service.ts` | 4 | M-L | U |
| E-06 | Catalogue public **sans recherche ni filtres** (commune, budget, pièces, meublé…), sans tri, sans pagination, sans carte globale. | `sales-catalog.tsx`, `catalog.service.ts` | 4 | M | U, R |
| E-07 | Pas de contact rapide sur les annonces (WhatsApp / appel de l'agence) : seul un formulaire de rendez-vous en bas de fiche. | `sale-listing-detail.tsx` | 4 | S | U, R |
| E-08 | Demandes publiques : dates passées acceptées (réservation), demande de visite possible sur un bien **vendu/archivé**. | `short-stay.service.ts` l.137-141, `sales.service.ts` l.177-187 | 2 | S | U |
| E-09 | Pièce d'identité du propriétaire : champ `idDocumentUrl` en base/DTO mais **aucun upload** dans l'interface. Champs `receiptTemplate`, `contractTemplate` (paramètres) et modèle `FinancialReport` **jamais utilisés**. | grep | 2 | S | — |
| E-10 | **Positionnement contradictoire** : la vitrine vend un SaaS multi-agences (« Demander une démo », 3 formules « Sur devis ») alors que l'application est **mono-agence** (un seul `CompanySettings`, tout le personnel voit tout). Elle mélange aussi un discours B2B (gestion locative) et un catalogue B2C (acheteurs, voyageurs). | `page.tsx`, `schema.prisma` | 4 | décision | C, R |
| E-11 | Pas de location longue durée dans le catalogue public : on ne peut pas chercher un appartement à louer au mois (cœur du marché), seulement vente et courte durée. | `catalog.controller.ts` | 5 | M | U, R |

### b) Traces typiques de code généré par IA
| ID | Constat | Preuve | Crit. | Effort |
|---|---|---|---|---|
| T-01 | **Données de démo présentées comme réelles** : 6 annonces fictives en prod, sans mention « démo », avec badge « Titre vérifié · ACD », photos Unsplash, et le texte « Chaque bien publié ici a été vérifié par notre agence ». | requête prod ; fiche `/catalogue/sales/:id` | 5 | S |
| T-02 | **Même photo de stock** (villa moderne avec piscine, style méditerranéen) réutilisée pour plusieurs annonces différentes (Angré, Assinie, Marcory). | captures 375 px | 4 | S |
| T-03 | **Géographie fausse** : « Riviera » listée comme commune (c'est un quartier de Cocody) ; Anyama et Songon absentes ; « Assinie » rattachée à la ville « Abidjan » ; pas de champ **quartier** (Angré, Riviera 2, Zone 4… sont mis dans le nom). | `packages/shared/src/constants.ts` ; données prod | 4 | M |
| T-04 | Vitrine en **template SaaS générique** : maquette de dashboard inclinable au survol, 6 cartes d'icônes identiques, étapes « 01/02/03 », 3 formules dont une « **Le plus choisi** » (preuve sociale inventée : aucun client), grille bleue en fond, cercle flou. | `app/(marketing)/page.tsx` | 3 | M |
| T-05 | Identité visuelle par défaut : bleu `#0B5FFF` + Inter, aucun élément propre au contexte ivoirien hors logo. | `tailwind.config.ts` | 3 | M |
| T-06 | Incohérences de vocabulaire immobilier ivoirien : « Villa 4 pièces » décrite avec « 4 chambres » ; types de biens manquants (cour commune, duplex, chambre-salon, entrepôt, lotissement) ; équipements manquants (compteur CIE/SODECI individuel ou prépayé, bâche à eau / surpresseur, eau chaude, cuisine interne, toilettes internes). | données prod ; `PROPERTY_AMENITIES` | 3 | S |
| T-07 | Mentions légales en ligne avec **`[à compléter]`** (raison sociale, siège, RCCM, directeur de publication, n° de déclaration ARTCI) ; pas de CGU ; politique de confidentialité muette sur les données des visiteurs/invités, les cookies et l'hébergement hors CI. | `mentions-legales/page.tsx`, `confidentialite/page.tsx` | 4 | S (structure) — contenu = utilisateur/juriste |
| T-08 | Affirmation juridique non sourcée sur la fiche vente : « droits de mutation … 4 % du prix ». | `sale-listing-detail.tsx` | 3 | S — **À VÉRIFIER PAR UN JURISTE** |
| T-09 | Libellé inexact : « mots de passe chiffrés » (ils sont hachés). | vitrine, FAQ | 1 | S |
| T-10 | Placeholders de téléphone « +225 07 00 00 00 00 » partout (acceptable) ; textes globalement en français correct et sobre (points positifs : pas de Lorem, pas d'anglais traduit). | grep | 1 | — |

### c) Dette technique
| ID | Constat | Crit. | Effort |
|---|---|---|---|
| D-01 | Fichiers stockés en `bytea` dans Postgres (Neon 1 Go) — bloquant pour photos nombreuses, vidéos, visites 3D. | 4 | M |
| D-02 | `README.md` obsolète : parle de stockage disque `UPLOAD_DIR`, Vercel, `prisma migrate dev` ; publie les identifiants (S-01). | 3 | S |
| D-03 | Aucun test côté web ; tests API sur `dist` uniquement ; pas de lint API ; `next lint` non exécuté en CI. | 3 | M |
| D-04 | Catalogue : `include` sans `select` (sur-exposition, voir S-04) ; incrément `viewCount` à chaque requête (pas de déduplication, compteurs gonflés par les robots). | 3 | S |
| D-05 | Une seule base Neon (`main`) pour dev et prod : le `.env` local écrit en prod. | 4 | S (branche dev) |
| D-06 | Render plan gratuit : réveil jusqu'à ~1 min (déjà signalé, palliatif « premier chargement » en place). | 4 | décision/€ |
| D-07 | Liste des communes en dur dans `packages/shared` sans notion de pays/région → bloque le multi-pays. | 2 | M |

### d) Performance, accessibilité, SEO
| ID | Constat | Crit. | Effort |
|---|---|---|---|
| P-01 | Pages catalogue rendues **côté client uniquement** (`"use client"` + `useQuery`) : le HTML initial ne contient pas les annonces → **non indexables** par Google, pas de `<title>`/description par annonce, pas de schema.org `RealEstateListing`. Le sitemap n'inclut pas les annonces. | 5 | M |
| P-02 | Animation de page `filter: blur()` sur tout le contenu (`app/template.tsx`) : coûteuse sur Android d'entrée de gamme ; pas de `MotionConfig reducedMotion="user"` vérifié. | 2 | S |
| P-03 | Images : `next/image` avec `sizes` corrects (bien), mais pas de compression/redimensionnement à l'upload (jusqu'à 5 Mo stockés tels quels). | 3 | M |
| P-04 | Accessibilité : un audit axe a été fait en octobre (commit `a11y`) ; FAQ et onglets avec ARIA corrects. À re-vérifier sur les nouvelles pages catalogue (contraste du texte gris clair `#6B7280` sur `#F8FAFC` limite). | 2 | S |
| P-05 | Mobile : hero vitrine = grand vide + maquette de dashboard sous la ligne de flottaison sur 375 px ; aucune action « chercher un bien » au premier écran. | 3 | S |

### e) Sécurité
Voir `07_SECURITE.md` : 4 CRITIQUES/ÉLEVÉS confirmés par test (S-01 à S-04) + 11 autres points.

### Points positifs à conserver
- Back-office riche et cohérent : baux par type (habitation nue/meublée, commercial, professionnel, terrain), états des lieux entrée/sortie avec comparaison, solde de caution, révision de loyer, reversements propriétaires, relevés PDF/CSV, quittances PDF avec logo, journal d'audit, 2FA, sessions.
- Courte durée : calendrier de disponibilité, contrôle serveur des chevauchements (vérifié dans le code).
- Vente : statut titre foncier + vérification par l'agence, offres, documents, finalisation.
- Formats ivoiriens déjà présents : FCFA (`formatXOF` → « 150 000 FCFA »), moyens de paiement locaux, avance/caution.

## Partie 2 — Écarts par domaine (Phase 3)
(à compléter après la Phase 2)
