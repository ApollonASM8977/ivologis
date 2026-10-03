# Procédure de sauvegarde et de restauration — IVOLOGIS

## Périmètre

| Élément | Où il est stocké | Sauvegarde |
|---|---|---|
| Données (biens, baux, paiements, comptes, journal) | PostgreSQL hébergé par Neon | Sauvegardes Neon + export `pg_dump` (ci-dessous) |
| Documents et photos (PDF, Word, quittances, photos) | Table `stored_files` dans la même base | Incluse dans la base |
| Code source | GitHub (`ApollonASM8977/ivologis`) | Historique Git |
| Configuration | Variables d'environnement Render (`JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`…) | À noter hors plateforme, dans un gestionnaire de secrets |

Les fichiers ne sont plus écrits sur le disque du service : ils font partie de la base. Une sauvegarde de la base suffit donc pour les documents.

## Objectifs

- **Perte de données maximale (RPO)** : 24 heures au plus, grâce à un export quotidien (à mettre en place, voir « Mise en place »).
- **Temps de restauration (RTO)** : moins de 2 heures pour rétablir le service sur une base restaurée.

## Sauvegardes automatiques (Neon)

Neon conserve un historique de la base permettant une restauration à un instant donné, dans la limite de la fenêtre de rétention de votre plan. Consultez la fenêtre applicable dans le tableau de bord Neon avant de compter dessus.

## Export manuel (`pg_dump`)

À exécuter depuis un poste disposant de PostgreSQL 16 (ou d'une version compatible), avec l'URL de connexion Neon **non publique** :

```bash
pg_dump --format=custom --no-owner --file="ivologis-$(date +%F).dump" "$DATABASE_URL"
```

Conservez le fichier `.dump` hors de GitHub, sur un stockage chiffré, et notez sa date.

## Restauration

1. **Choisir le point de restauration** : soit un instant précis dans la fenêtre Neon (crée une nouvelle branche), soit un fichier `.dump`.
2. **Créer une base cible** (nouvelle branche Neon ou base vide).
3. **Restaurer un fichier `.dump`** :

   ```bash
   pg_restore --no-owner --clean --if-exists --dbname="$TARGET_DATABASE_URL" ivologis-2026-10-03.dump
   ```

4. **Vérifier les données** : nombre de baux, dernier paiement, dernière demande de maintenance, et ouverture d'un document (via l'application, un lien signé doit fonctionner).
5. **Basculer l'application** : mettre à jour `DATABASE_URL` sur le service API Render, puis déclencher un déploiement (`prisma migrate deploy` s'exécute au build et ne modifie rien si la base est à jour).
6. **Contrôler le service** : page d'accueil, connexion d'un compte administrateur (double authentification), tableau de bord locataire.
7. **Informer les utilisateurs** si des données récentes ont été perdues.

## Mise en place (à faire une fois)

- Créer un secret `DATABASE_URL` dans GitHub (Settings → Secrets → Actions) et un workflow planifié qui exécute `pg_dump` chaque nuit, puis envoie le fichier dans un stockage chiffré.
- Ajouter une alerte (email ou messagerie) si l'export échoue.
- Planifier un **test de restauration mensuel** sur une branche Neon jetable, et noter le résultat dans le journal ci-dessous.

## Journal des tests de restauration

| Date | Point restauré | Durée | Résultat | Par |
|---|---|---|---|---|
| — | — | — | — | — |

## Responsabilités

- Responsable des sauvegardes : `[à compléter]`
- Contact d'urgence : `[à compléter]`
- Accès aux comptes Neon et Render : `[à compléter]`
