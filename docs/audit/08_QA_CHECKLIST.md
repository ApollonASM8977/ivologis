# 08 — Checklist QA

Statut : squelette (rempli au fil des tâches, finalisé en Phase 8).

## Commandes de vérification
```bash
npm run build:shared
npx tsc --noEmit -p apps/api/tsconfig.json
npm run test --workspace=@ivologis/api
npx tsc --noEmit -p apps/web/tsconfig.json
npm run build:web
```

## Parcours par rôle (à tester en local)
- [ ] Visiteur : vitrine → catalogue vente → fiche → demande de visite (invité) → référence affichée
- [ ] Visiteur : catalogue courte durée → fiche → calendrier → demande de réservation
- [ ] Locataire : connexion → tableau de bord → paiement → quittance → maintenance → demande
- [ ] Propriétaire : connexion → biens → mise en vente → demandes de visite → relevé
- [ ] Agent/Admin : biens, baux, paiements, confirmations, vérification titre foncier, documents de vente
- [ ] Petit écran (360 px) et connexion lente (3G simulée)

## Sécurité
- [ ] Les points CRITIQUE/ÉLEVÉ de `07_SECURITE.md` sont CORRIGÉS ou ACCEPTÉS par écrit

## Relecture légale
- [ ] Textes marqués « À VÉRIFIER PAR UN JURISTE » relus
