# 05 — Journal des décisions

Format : ID · date · décision · justification · alternatives écartées.

| ID | Date | Décision | Justification |
|---|---|---|---|
| D-01 | 2026-11-17 | Documentation d'audit en français dans `docs/audit/` (structure demandée par l'utilisateur), commits au format `type(ID): message` en français, **sans ligne Co-Authored-By**. | Demande explicite de l'utilisateur ; l'historique git du projet est déjà en français. |
| D-02 | 2026-11-17 | Aucune connexion au site de production avec les mots de passe de test publiés ; aucune suppression de données en prod sans accord explicite. | Sécurité et règle « actions irréversibles = confirmation ». Les vérifications prod se font en lecture seule (SQL `SELECT`). |
| D-04 | 2026-11-17 | Commits locaux uniquement ; **pas de push** tant que les failles S-01 à S-04 ne sont pas corrigées et déployées. Recommandation à l'utilisateur : passer le dépôt en privé (il contient aussi les mots de passe dans l'historique git). | Le dépôt est public : pousser `07_SECURITE.md` publierait un mode d'emploi d'attaque. |
| D-05 | 2026-11-17 | Tests sur une branche Neon `audit-qa` (copie de la prod), jamais sur `main`. | Le `.env` local pointait sur la base de prod ; les tests créent des paiements, ventes et comptes. |
| D-03 | 2026-11-17 | 2FA obligatoire des comptes internes : **en attente de l'utilisateur** (il l'a désactivée le 2026-10-07 pour ses tests). Recommandation : la réactiver avant toute ouverture au public. | Choix qui change son usage quotidien → décision utilisateur. |
