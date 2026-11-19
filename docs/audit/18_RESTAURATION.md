# 18 — Restauration des données (P1-14)

Rédigé le 2026-11-19. **Test réel fait le 2026-11-19 avec l'accord de l'utilisateur** (résultat en bas de page).

## Ce qui est sauvegardé
- **Toute la donnée métier est dans Neon** (projet `fancy-star-15869804`) : biens, baux, paiements, comptes… et aussi les **fichiers** (photos, PDF, pièces) dans la table `stored_files`. Restaurer la base restaure donc aussi les fichiers.
- Neon garde un **historique** qui permet de revenir à un instant passé (« Instant restore » / branche à un instant donné). Durée de cet historique **vérifiée le 2026-11-19 : 6 heures** (`history_retention_seconds = 21600`, offre `free_v3`) : une erreur remarquée plus de 6 h après ne peut plus être annulée. Elle est courte : passer à une offre payante fait partie des prérequis d'ouverture (`17_PLAN_LANCEMENT.md`, D-17).
- Rien d'autre à sauvegarder : Render ne garde aucune donnée (le code est sur GitHub, les secrets dans les variables d'environnement Render).

## A. Test de restauration (sur `audit-qa`, jamais sur `main`) — à faire une fois par trimestre
1. Noter l'heure T (UTC) et un repère : par exemple le nombre de lignes de `properties`, `leases`, `payments`, `stored_files` sur `audit-qa`.
2. Faire une modification visible sur `audit-qa` après T (ex. créer un locataire « QA restauration »).
3. Console Neon → branche `audit-qa` → **Branches → Create branch → « Past data » à l'instant T** (nom : `restore-test-AAAAMMJJ`). Par l'API : `POST /projects/{id}/branches` avec `parent_id = br-shy-fog-b1hl85o4` et `parent_timestamp = T`.
4. Vérifier sur la nouvelle branche (éditeur SQL de la console ou `run_sql` avec son `br-…`) : mêmes comptes qu'au point 1, et le locataire « QA restauration » **absent** ; `SELECT count(*) FROM _prisma_migrations` identique à `audit-qa`.
5. Optionnel : lancer l'API locale sur cette branche (`DATABASE_URL` de la branche, port 3101) et `qa-securite.mjs` (lecture et écriture de test).
6. **Supprimer la branche de test** (`restore-test-…`) et noter le résultat (durée, comptes) dans `08_QA_CHECKLIST.md`.

## B. Incident en production (erreur de manipulation, données abîmées)
1. Mettre le site en pause côté écriture si possible (désactiver le service API sur Render) pour ne pas accumuler de nouvelles écritures.
2. Identifier l'instant T juste avant l'incident (journal d'activité `/admin/audit-log`, journaux Render).
3. Console Neon → branche `main` → **Restore → instant T**. Neon garde automatiquement l'état d'avant la restauration dans une branche de secours (pour revenir en arrière si T était mal choisi).
4. Relancer l'API sur Render (pas de nouveau déploiement nécessaire : l'adresse de la base ne change pas). Vérifier : connexion admin, une fiche de bien, une quittance PDF, `GET /api/catalog/rentals`.
5. Prévenir les utilisateurs touchés si des écritures entre T et la restauration sont perdues (notamment paiements déclarés) ; les ressaisir à partir des reçus.
6. Consigner l'incident (`07_SECURITE.md` s'il s'agit de sécurité, sinon `00_HANDOFF.md`).

## Ce que la restauration ne couvre pas
- Une restauration au-delà de la fenêtre d'historique de l'offre Neon : d'où la recommandation d'une **exportation régulière** (`pg_dump` hebdomadaire vers un stockage externe) à mettre en place avec les comptes fournisseurs (D-17).

## Résultat du test du 2026-11-19 (audit-qa)
- Instant T = 14:04:47 UTC : 17 biens, 7 baux, 21 paiements, 28 locataires, 34 fichiers (47 735 octets), 23 migrations ; marqueur `RESTORE_TEST_MARKER` écrit à 14:04:55 dans `audit_logs`.
- **Retour à un instant passé par l'outil Neon de l'agent : impossible** — les instantanés (snapshots) ne sont permis que sur la branche racine (`main` = production, exclue) et la création de branche de l'outil part des données actuelles. Ce retour à T se fait **dans la console Neon** (§ A, étape 3) : à faire une fois par l'utilisateur (2 minutes) ou avec son accord dans le navigateur.
- **Copie complète d'`audit-qa` dans une branche temporaire** (`restore-test-20261119`, créée à 14:05:39) : comptes identiques, et empreinte MD5 du contenu des 34 fichiers identique (`af5de72c…`) → la base et les fichiers se recopient sans perte. Branche supprimée ensuite ; il ne reste que `main` et `audit-qa`.
