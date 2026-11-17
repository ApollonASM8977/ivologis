# 06 — Design system

Statut : À FAIRE (Phase 7). Point de départ : relever les tokens réels dans `apps/web/tailwind.config.ts` et `apps/web/app/globals.css` (Phase 1), puis définir l'identité cible.

## Tokens existants (relevé Phase 1, `apps/web/tailwind.config.ts`)
| Token | Valeur | Remarque |
|---|---|---|
| `primary` | `#0B5FFF` | bleu « SaaS » générique (trace T-05) |
| `primary-dark` | `#0B1F3A` | bleu nuit, titres |
| `success` / `danger` / `warning` | `#15803D` / `#DC2626` / `#B45309` | contrastes AA corrects sur blanc |
| `surface` | `#F8FAFC` | fond de section |
| `ink` / `ink-muted` | `#111827` / `#6B7280` | texte |
| Police | Inter, Poppins, system-ui | aucune police chargée explicitement à vérifier (`app/layout.tsx`) |
| Rayon `xl` | `0.875rem` | |
Composants UI maison : `components/ui/*` (Avatar, Badge, Button, Card — **ne pas surcharger le padding via className**, ConfirmDialog, DataTable, EmptyState, Input/Label/Textarea, Modal, PageHeader, PasswordStrength, SearchInput, Skeleton/LoadingState, Stagger, StatCard).
Logo : case africaine (toit conique terre cuite) — `components/brand-logo.tsx`.

## Identité cible
## Composants
## Règles (photos, cartes de biens, contact en 2 taps, accessibilité, copywriting)
