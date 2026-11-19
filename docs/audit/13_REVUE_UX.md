# 13 — Revue UI/UX, fluidité et utilisateurs (2026-11-17)

Démarche : testeur UI/UX sur téléphone (375-412 px) et ordinateur, visiteur + 3 rôles (admin, propriétaire, locataire), réseau lent simulé (4G lente, processeur ×4), tests automatisés (`apps/api/test/qa-securite.mjs`, test de fumée 41 pages, Lighthouse médiane de 3). Seuls des constats **observés** figurent ici. Gravité : 🔴 bloquant / 🟠 important / 🟡 confort.

## 1. Corrigé pendant cette revue
| # | Constat | Correction |
|---|---|---|
| U-01 🔴 | Toutes les pages démarraient invisibles (transition globale opacité 0 + flou en JavaScript) : 4-5 s d'écran blanc en 3G, pages « délavées » en navigation. | Transition CSS en mouvement seul (`app/template.tsx`). |
| U-02 🔴 | Animations mortes sur téléphone/tablette : la carte de l'accueil ne bougeait qu'à la souris, les effets n'existaient qu'au survol. | Carte qui flotte en continu et suit le doigt ; retour au toucher sur les cartes ; halo au doigt. |
| U-03 🟠 | Le message WhatsApp d'une annonce ne contenait jamais le lien de l'annonce. | Lien ajouté (lu dans le navigateur). |
| U-04 🟠 | Bouton WhatsApp peu lisible (contraste 4,1:1). | 5:1. |
| U-05 🟠 | Fenêtres modales sans rôle « dialogue » ni bouton Fermer nommé (lecteurs d'écran). | Corrigé pour toutes les modales. |
| U-06 🟠 | Titres et descriptions des pages catalogue/fiches envoyés en différé dans le corps de page (perdus pour Google et les partages). | Toujours dans `<head>`. |
| U-07 🟠 | Chargements : simple pulsation grise. | « Maison qui se construit » (CSS pur) sur tous les écrans et à chaque navigation des espaces. |
| U-08 🟠 | Messages d'erreur en anglais ; erreurs techniques affichées telles quelles. | Tout en français, message neutre pour les erreurs internes. |

## 2. Performance mesurée (mobile, 4G lente simulée, médiane de 3)
| Page | Avant | Après (local, build prod) | Production |
|---|---|---|---|
| Accueil | 66 (prod 73) | 79 — a11y/BP/SEO **100** | 75 (avant le 2e lot) |
| Logements à louer | 63 (prod 70) | 88 — a11y/BP/SEO **100** | 84 (avant le 2e lot) |
| Fiche d'annonce | 63 | 71-82 (après correctif) | à remesurer |
| Connexion | 88 | 82 | 82 |
JavaScript initial : accueil 215 → 117 kB, catalogue 208 → 155 kB, fiche 233 → 180 kB. LCP prod : 4-5 s → 2,4-2,6 s.

**Mise à jour du 2026-11-18 — mesure de référence sur Linux** (workflow GitHub `Lighthouse`, mobile, médiane de 5, production d'avant la session) : accueil **97**, sécurité **100**, connexion **99**, catalogue 93 ; accessibilité, bonnes pratiques et SEO à 100. Les chiffres locaux ci-dessus (Windows) sont pessimistes : sur ce poste, la première mise en page coûte ~110 ms même pour une page vide, multipliés par 4 par Lighthouse (D-15). Le catalogue perdait des points parce que **l'API dormait** pendant la mesure (service gratuit distinct) : le site la réveille désormais dès son démarrage (`instrumentation.ts`).

**Ce qui empêchait 96+** (analyse du 2026-11-17, en partie dépassée) :
1. 🔴 **Hébergement gratuit Render** : le serveur s'endort ; le premier visiteur attend jusqu'à une minute (le site l'annonce même : « Premier chargement : jusqu'à une minute »). Aucun réglage de code ne compense. → Instance payante (≈ 7 $/mois par service) ou ping régulier. Prérequis à toute mesure sérieuse.
2. 🟠 Socle React/Next (≈ 100 kB compressés) exécuté avant l'interactivité : sur un téléphone d'entrée de gamme simulé, 250-550 ms de blocage. Pistes restantes : retirer React Query du socle commun (le mettre seulement où il sert), découper davantage, page d'accueil statique pure. Au-delà, viser 96+ en mobile demanderait une vitrine sans React (ex. HTML statique/Astro) — à décider.
3. 🟡 Mesures locales bruitées (±10 points) : la référence officielle est PageSpeed Insights sur la prod (quota anonyme épuisé le 2026-11-17 ; une clé API gratuite Google permettrait un suivi quotidien).

## 3. Restant à corriger (relevé, non traité)
| # | Écran | Constat | Proposition |
|---|---|---|---|
| U-10 🔴 | Tous | **Notifications seulement dans l'application** : un locataire ou un propriétaire qui ne se connecte pas ne sait pas que sa demande avance. | E-mail (Brevo) + WhatsApp/SMS dès que les comptes fournisseurs existent (`09_FOURNISSEURS.md`). |
| U-11 🟠 | Admin, menu | 19 entrées à plat ; trois boîtes aux noms proches (« Demandes clients », « Demandes de démo », « Demandes locataires »). | Menu en groupes (Parc, Locatif, Ventes & séjours, Agence) ; une seule « Boîte de réception » à onglets. **FAIT 2026-11-19** (lot `lot/hors-lancement`) : rubriques Parc / Locatif / Ventes & séjours / Agence, une entrée « Boîte de réception » à 3 onglets (adresses inchangées). |
| U-12 🟠 | Tableaux (paiements, contrats, locataires…) sur téléphone | Tableaux à 6-7 colonnes : défilement horizontal à 375 px. | Affichage en cartes sous 640 px. **FAIT 2026-11-19** : `DataTable` affiche une carte par ligne sous 640 px (toutes les listes de l'admin et des espaces). |
| U-13 🟠 | Profil locataire | Champ « Mot de passe (optionnel) » rangé dans « Situation professionnelle ». | Le sortir dans « Sécurité du compte ». **FAIT 2026-11-19** : rubrique « Sécurité du compte » à la création par l'agence ; retiré du profil du locataire (changement par la carte « Sécurité du compte », mot de passe actuel exigé). Au passage : l'enregistrement du profil locataire échouait toujours (400, 32 champs envoyés) → corrigé. |
| U-14 🟠 | Profil (tous) | Liste « Appareils connectés » sans limite (12 « Ordinateur » identiques observés), sans navigateur ni ville. | Nettoyer les sessions expirées, afficher navigateur/système, « Fermer les autres sessions ». **FAIT 2026-11-19** : sessions expirées masquées, « Ordinateur · Chrome · Windows », bouton « Fermer les autres sessions ». Ville : demande un service de géolocalisation d'IP (D-17, non fait). |
| U-15 🟡 | Fiches admin (maintenance…) | Bouton « Retour » = historique du navigateur : ouvert depuis un lien ou une notification, il fait sortir de l'application. | Lien explicite vers la liste. **FAIT 2026-11-19** : « Retour » = lien vers la liste (maintenance, propriétaires, locataires, biens). |
| U-16 🟡 | Accueil (connecté) | Un utilisateur connecté qui ouvre l'accueil est renvoyé vers son tableau de bord : impossible de consulter le site public ou le catalogue sans se déconnecter. | Laisser l'accueil accessible, bouton « Mon espace » dans l'en-tête. **FAIT 2026-11-19** : accueil servi aux connectés, « Mon espace » à la place de « Se connecter » (lu après affichage, page toujours statique). |
| U-17 🟡 | Modales | Pas de piège du focus (Tab peut sortir de la fenêtre). | Piège du focus + retour du focus à l'élément d'origine. **FAIT 2026-11-19** : `useFocusTrap` sur les 4 fenêtres (modale, galerie, recherche rapide, photos du locataire). |
| U-18 🟡 | Catalogue | Pas de carte des annonces, pas d'alerte « nouveau bien correspondant ». | Vue carte (OpenStreetMap) ; alertes e-mail/WhatsApp. |
| U-19 🟡 | Paiements | Pas de paiement en ligne (déclaration + vérification par l'agence). | Agrégateur (Paystack/CinetPay) quand le compte existe. |
| U-20 🟠 | Tout le site | Pas de version anglaise. | Lot I (i18n FR/EN intégral) — voir `00_HANDOFF.md`. |
| U-21 🟠 | Tout le site | Pas de mode hors ligne. | `10_MODE_HORS_LIGNE.md` (P2-13..16). |

## 4. « Ce qui pourrait ne pas marcher » chez de vrais utilisateurs
- Réseau coupé pendant un envoi (paiement déclaré, photo de panne) : l'action échoue sans file d'attente → mode hors ligne (U-21).
- Téléphone avec « Réduire les animations » activé (iPhone, Android) : le site respecte ce réglage et paraît statique — c'est voulu (accessibilité).
- Numéros saisis sans indicatif (07…) : convertis en +225 pour WhatsApp ; numéros étrangers à vérifier.
- Photos très lourdes (12 Mo d'un téléphone récent) : refusées au-delà de 5 Mo, sans compression côté téléphone → compresser avant envoi.
- Premier chargement après inactivité (hébergement gratuit) : jusqu'à une minute → voir § 2.
