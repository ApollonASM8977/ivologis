# 06 — Design system IVOLOGIS

Version 1 — 2026-11-17 (Phase 7). Source de vérité des valeurs : `apps/web/tailwind.config.ts`.

## Intention
Une agence immobilière ivoirienne sérieuse, chaleureuse et lisible sur un Android d'entrée de gamme. Inspiration locale **sans cliché** (pas de motifs kente, pas de drapeau, pas de dégradé violet « IA ») : la **lagune Ébrié** (bleu-vert profond) et la **terre latérite** (rouge-orangé du toit du logo), sur un fond **sable**.

## Couleurs (tokens Tailwind)
| Token | Valeur | Usage | Contraste |
|---|---|---|---|
| `primary` | `#0B5563` bleu lagune | boutons principaux, liens, onglets actifs | texte blanc 8,4:1 |
| `primary-dark` | `#082F37` | titres | > 12:1 sur blanc/sable |
| `accent` | `#B5502A` terre latérite | action de recherche, sur-titres, détails (usage rare) | texte blanc 5,1:1 ; sur sable 4,6:1 |
| `accent-soft` | `#F6E7DF` | fonds de mise en avant légers | — |
| `surface` | `#F7F4EE` sable | fonds de section, fond de l'espace de gestion | — |
| `ink` / `ink-muted` | `#1C1917` / `#57534E` | texte / texte secondaire | 7,3:1 pour `ink-muted` sur sable |
| `success` / `warning` / `danger` | `#15803D` / `#B45309` / `#DC2626` | statuts uniquement (jamais décoratif) | AA |
| Démo | `amber-100` / `amber-900` | bandeau et badge « Démo » | AA |
Règle : la terre latérite n'est jamais utilisée pour une erreur (le rouge `danger` est réservé aux erreurs).

## Typographie
- Texte : **Manrope** (chiffres bien dessinés pour les prix en FCFA), auto-hébergée par `next/font`, `display: swap`.
- Titres de la vitrine (`.marketing h1, h2`) : **Fraunces** 600/700. L'espace de gestion reste en Manrope seule (densité).
- Correction : l'ancienne configuration chargeait Inter sans jamais l'appliquer (nom de famille ne correspondant pas à la variable `next/font`).

## Composants clés
- `components/marketing/hero-search.tsx` : recherche Louer / Acheter / Séjourner + commune + budget, visible au premier écran à 375 px, mène au catalogue filtré.
- `components/catalog/catalog-list.tsx` : filtres dans l'URL, compteur, pagination, carte d'annonce avec badges `Démo`, `Titre vérifié`, `Meublé`, pièces et surface.
- `components/catalog/property-extras.tsx` : `DemoNotice`, `DemoBadge`, `AgencyContact` (WhatsApp vert `#1F8F4E` + appel), `LocationMap`, `VirtualTourCard`, `locationLabel`.
- Composants de base `components/ui/*` (Button, Card — ne pas surcharger son padding par `className` —, Input, Select, Modal, Badge, EmptyState, Skeleton).

## Règles
1. **Mobile d'abord** : tester à 375 px ; actions principales sans défilement (recherche, contact agence, demande de visite).
2. **Contact en 2 gestes** vers l'agence, jamais vers le propriétaire.
3. **Prix** : `formatXOF` → « 150 000 FCFA » ; suffixe « / mois » ou « / nuit ».
4. **Photos** : ratio paysage, `next/image` avec `sizes`, placeholder neutre (icône) si aucune photo ; pas de photo de stock présentée comme le bien réel (sinon bandeau Démo).
5. **États** : chargement (squelette + indication de réveil du serveur), vide (message utile), erreur (message en français).
6. **Mouvement** : animations courtes, `MotionConfig reducedMotion="user"` sur la vitrine ; pas d'effet coûteux sur le contenu principal.
7. **Copywriting** : français ivoirien clair, aucune promesse non tenue par le logiciel, aucune preuve sociale inventée.

## Reste à faire (Phase 7, suite)
- Vitrine : sections B2B (fonctionnalités, tarifs) à repositionner selon la décision E-10 ; en-tête « Demander une démo » idem.
- Fiche annonce : galerie plein écran, carrousel sur mobile.
- Espace de gestion : appliquer `surface` et la nouvelle palette aux graphiques (fait pour les couleurs principales), revue des contrastes.
- Dark mode (P2-12).
