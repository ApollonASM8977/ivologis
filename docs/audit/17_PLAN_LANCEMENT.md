# 17 — Plan de lancement et code restant (2026-11-19)

**Où on en est** : le logiciel est construit et sécurisé (P0 de code 16/18, 41/41 contrôles de sécurité, A/B 16/16, CSP en prod, Lighthouse mobile prod 97-100, bilingue complet — détail `16_PRE_LANCEMENT.md`). **Aucun des 10 prérequis d'ouverture au public n'est encore bouclé**, et 7 dépendent de l'utilisateur (achats, comptes, démarches).
**Prix** : relevés le 2026-11-19, à **reconfirmer sur la page officielle au moment de payer**. 1 USD ≈ 600 FCFA (indicatif, voir `09_FOURNISSEURS.md`). Ce qui n'a pas pu être vérifié est marqué « NON VÉRIFIÉ ».

## 1. Les 10 prérequis

| # | Prérequis | Qui | Coût | Délai | Dépend de |
|---|---|---|---|---|---|
| 1 | Changer les mots de passe des comptes de test en prod (S-01), dont le SUPER_ADMIN | Utilisateur (+ code : retrait des comptes de démo) | 0 | 30 min | Fin des tests (D-06) |
| 2 | 2FA obligatoire pour l'agence (S-06) | Décision utilisateur, puis code (1 ligne) + chaque compte interne active son application d'authentification | 0 | 1 h | 1 |
| 3 | Vérifier que le `JWT_SECRET` de Render n'est pas la valeur d'exemple (le remplacer déconnecte tout le monde, sans autre effet) | Utilisateur | 0 | 5 min | — |
| 4 | Hébergement payant : site et API en **Render Starter** (plus de mise en veille ni ~50 s d'attente) | Utilisateur (achat) | 2 × 7 $ = **14 $/mois ≈ 8 400 FCFA** | 10 min | — |
| 5 | Nom de domaine (`ivologis.ci`) puis cookie de session `httpOnly` (S-08) | Utilisateur (achat, DNS) puis code | `.ci` ≈ **45 000 FCFA/an** au registre NIC CI (ordre de grandeur, source commerciale, NON VÉRIFIÉ officiellement) ; 2 à 5 jours | 1 semaine | — |
| 6 | ARTCI : désigner et enregistrer un **correspondant à la protection des données** (obligatoire, formulaire en ligne depuis janv. 2026) ; **autorisation préalable** du traitement et du **transfert hors CEDEAO** (serveurs Render Francfort, Neon `eu-central-1`) | Utilisateur ⚖️ | Frais et délais NON VÉRIFIÉS (non publiés en ligne) → demander à l'ARTCI | Le plus long : **à lancer en premier** | — |
| 7 | CGU, politique de confidentialité, mentions légales (RCCM, agrément, n° ARTCI) relues par un juriste | Utilisateur ⚖️ | Devis juriste | 1-3 semaines | 6 (n° ARTCI) |
| 8 | Sauvegardes : passer Neon en **Launch** (restauration jusqu'à **7 jours** au lieu de 6 h) + **test de restauration** prouvé | Utilisateur (activer) + code (procédure, test) | À l'usage, sans minimum : ≈ 5 à 20 $/mois selon l'activité (ESTIMATION) ; historique 0,20 $/Go-mois | 1 h | — |
| 9 | Supervision : alerte si le site ou l'API tombe (**UptimeRobot**, 50 sondes, 5 min) + suivi des erreurs (**Sentry**, ~5 000 erreurs/mois) | Utilisateur (comptes gratuits) + code (Sentry) | 0 (offres gratuites ; conditions d'usage commercial d'UptimeRobot à relire) | 2 h | — |
| 10 | Retirer les données et images de démonstration, créer les vrais comptes, supprimer ceux de test (P0-17) | Utilisateur (liste des vrais comptes) + code | 0 | 2 h | 1, 2 |

## 2. Ordre recommandé

**Étape A — tout de suite, gratuit (toi, 1 heure)**
- #3 vérifier le `JWT_SECRET` ; #6 contacter l'ARTCI et enregistrer le correspondant (le délai le plus long) ; #7 demander un devis à un juriste.

**Étape B — achats et comptes (toi, 1 soirée, ≈ 15 000 à 25 000 FCFA/mois + domaine)**
- #4 Render Starter ×2 ; #5 domaine `.ci` ; #8 Neon Launch ; #9 UptimeRobot + Sentry ; et pour la suite : Brevo (e-mails, gratuit), Cloudflare R2 (photos, gratuit jusqu'à 10 Go), Paystack en **mode test** (`09_FOURNISSEURS.md`).

**Étape C — bascule technique (moi, 1-2 jours, une fois B fait)**
- Domaine branché sur Render, `NEXT_PUBLIC_SITE_URL` et CORS mis à jour ; cookie `httpOnly` (P1-13) ; e-mails réels (P1-10, SPF/DKIM sur le domaine) ; Sentry branché ; sondes UptimeRobot ; test de restauration Neon documenté ; Lighthouse + CSP refaits sur le nouveau domaine.

**Étape D — ouverture (ensemble, 1/2 journée)**
- #1 mots de passe, #2 2FA, #10 vrais comptes et retrait des démos ; dernière vérification complète ; ouverture. Conditions : réponse ARTCI et relecture juridique reçues (#6, #7).

## 3. Budget de démarrage

| Poste | Coût |
|---|---|
| Render Starter, site + API | 14 $/mois ≈ 8 400 FCFA |
| Neon Launch (base + sauvegardes 7 jours) | ≈ 5 à 20 $/mois ≈ 3 000 à 12 000 FCFA (ESTIMATION, à l'usage) |
| E-mails Brevo, photos R2, UptimeRobot, Sentry | 0 (offres gratuites) |
| **Total mensuel** | **≈ 11 400 à 20 400 FCFA** |
| Domaine `.ci` | ≈ 45 000 FCFA/an (à confirmer auprès du NIC CI) |
| Juriste, ARTCI | Devis / frais à demander |
| Paiement en ligne (plus tard) | Pourcentage par transaction (Paystack CI : 1,95 % mobile money, hors TVA) |
| Dépassement de bande passante Render | 0,15 $/Go au-delà de l'inclus |

## 4. Ce qui reste à coder

**a) Faisable tout de suite, sans rien attendre**
| Tâche | Effort | Réf. |
|---|---|---|
| `.env` local sur une branche Neon de développement (le poste n'écrit plus jamais en prod) | S | P1-15, S-23 |
| Tests web des parcours (catalogue, inscription) + `next lint` en CI | M | P1-14 |
| File « annonces à vérifier » pour l'admin | S | P1-17 |
| Suivi public d'une demande par référence + téléphone | S | P1-07 |
| Types de biens et équipements ivoiriens (cour commune, chambre-salon, compteurs CIE/SODECI…) | S | P1-08 |
| Vérification foncière documentée (date, vérificateur, pièce archivée, badge) | M | P1-09 |
| Relances automatiques des loyers impayés | M | P1-16 |
| Passage à NestJS 12 (4 alertes modérées restantes) | M-L | S-15 |
| Procédure et script de test de restauration (sur `audit-qa` d'abord) | S | #8 |

**b) Après une décision de l'utilisateur**
| Tâche | Effort | Attend |
|---|---|---|
| 2FA obligatoire | S | Décision D-03 |
| Bandeau qui recouvre « Créer mon compte » à 390 px | S | Choix sur maquette (D-10) |
| Entrée « Confier / gérer mes biens » de la vitrine | M | Décision E-10 (mono-agence ou SaaS) |
| Retrait des démos + vrais comptes | S | Liste des comptes (#10) |

**c) Après création des comptes (étape B)**
| Tâche | Effort | Attend |
|---|---|---|
| Domaine + cookie `httpOnly` | L | Domaine (#5) |
| E-mails transactionnels (mot de passe oublié réel, accusés) | M | Domaine + Brevo |
| Suivi des erreurs | S | Sentry |
| Stockage des photos hors base + octets magiques | M | Cloudflare R2 (S-14, S-17) |
| Paiement réel Mobile Money (webhook signé) | L | Paystack test (P1-11) |

## 5. Décisions et éléments attendus de l'utilisateur
1. Feu vert pour l'étape A (ARTCI, juriste, `JWT_SECRET`).
2. Budget d'environ 11 400 à 20 400 FCFA/mois + domaine : accord pour Render Starter, Neon Launch, domaine `.ci`.
3. Décisions D-03 (2FA), E-10 (mono-agence ou SaaS), choix du bandeau (D-10), qui paie les frais de paiement.
4. Liste des vrais comptes à créer le jour de l'ouverture.

## Sources (consultées le 2026-11-19)
- Render : [tarifs officiels](https://render.com/pricing) ; [guide 2026](https://deploycloud-shopify.devcloudsoftware.com/blog/render-pricing).
- Neon : [fenêtre de restauration (doc officielle)](https://neon.com/docs/postgres/backup-restore/history-window) ; [tarifs 2026 (Jetadmin)](https://www.jetadmin.io/blog/neon-pricing/).
- Domaine `.ci` : [Kolonell, 2026 (commercial)](https://kolonell.com/fr/blog/domaine-ci-extension-cote-ivoire-enregistrement-2026) ; [domaindetails](https://www.domaindetails.com/tlds/ci).
- ARTCI : [enregistrement des correspondants (Digital Mag)](https://digitalmag.ci/donnees-personnelles-lenregistrement-des-correspondants-a-la-protection-des-donnees-est-ouvert-a-lartci/) ; loi 2013-450 : voir `16_PRE_LANCEMENT.md`.
- Supervision : [UptimeRobot gratuit 2026 (Costbench)](https://costbench.com/software/network-monitoring/uptime-robot/free-plan/) ; [Sentry gratuit 2026 (Costbench)](https://costbench.com/software/developer-tools/sentry/free-plan/).
- E-mails, stockage, paiement : `09_FOURNISSEURS.md`.
