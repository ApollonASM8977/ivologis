# 06 — Design system IVOLOGIS

**Décision utilisateur du 2026-11-17 (D-10)** : le design d'origine est la référence. La refonte « lagune / latérite / sable » (commit `954b3fa`) a été annulée par `git revert` à sa demande : il veut un site **vivant, interactif, avec beaucoup d'animations et de chargements animés**. Aucune modification d'identité visuelle (couleurs, polices, accueil) sans validation préalable sur aperçu.

## Tokens (source : `apps/web/tailwind.config.ts`)
| Token | Valeur | Usage |
|---|---|---|
| `primary` | `#0B5FFF` | boutons, liens, accents, dégradés |
| `primary-dark` | `#0B1F3A` | titres |
| `success` / `danger` / `warning` | `#15803D` / `#DC2626` / `#B45309` | statuts |
| `surface` | `#F8FAFC` | fonds de section, fond de l'espace de gestion |
| `ink` / `ink-muted` | `#111827` / `#6B7280` | texte / texte secondaire |
| Démo | `amber-100` / `amber-900` | bandeau et badge « Démo » |
| Rayon `xl` | `0.875rem` | cartes |
Police : `Inter, Poppins, system-ui` (rendu actuel apprécié par l'utilisateur ; ne pas changer sans accord).

## Animation (identité du produit)
Bibliothèque `motion` déjà en place. Règles :
- Vitrine : `Reveal` à l'apparition, maquette de tableau de bord inclinable au survol, compteurs animés, cartes « spotlight », indicateur de progression de défilement, transitions de page (`app/template.tsx`).
- Listes et grilles : apparition en cascade (`components/ui/stagger.tsx`), cartes qui se soulèvent au survol, squelettes animés pendant le chargement (jamais un écran vide).
- Retours d'action : toasts (`sonner`), boutons avec état `loading`, compteurs (`CountUp`), anneaux de progression (`ProgressRing`).
- Accessibilité : `MotionConfig reducedMotion="user"` (respecte le réglage « réduire les animations » du téléphone).

## Composants clés
- `components/catalog/catalog-list.tsx` : filtres dans l'URL, compteur, pagination, cartes d'annonce (badges Démo, Titre vérifié, Meublé).
- `components/catalog/property-extras.tsx` : `DemoNotice`, `DemoBadge`, `AgencyContact` (WhatsApp + appel), `LocationMap`, `VirtualTourCard`, `locationLabel`.
- `components/ui/*` : Button (état `loading`), Card (ne pas surcharger le padding par `className`), Modal, Badge, EmptyState, Skeleton/LoadingState, Stagger, StatCard, SearchInput.

## Règles
1. Mobile d'abord (375 px), actions principales visibles sans défilement.
2. Contact en 2 gestes vers l'agence, jamais vers le propriétaire.
3. Prix : `formatXOF` → « 150 000 FCFA », suffixe « / mois » ou « / nuit ».
4. Photos : `next/image` avec `sizes` ; pas de photo de stock présentée comme le bien réel (sinon bandeau Démo).
5. États chargement / vide / erreur toujours traités, en français.
6. Copywriting : aucune promesse non tenue par le logiciel, aucune preuve sociale inventée.
