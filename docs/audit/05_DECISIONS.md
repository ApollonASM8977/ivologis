# 05 — Journal des décisions

Format : ID · date · décision · justification · alternatives écartées.

| ID | Date | Décision | Justification |
|---|---|---|---|
| D-01 | 2026-11-17 | Documentation d'audit en français dans `docs/audit/` (structure demandée par l'utilisateur), commits au format `type(ID): message` en français, **sans ligne Co-Authored-By**. | Demande explicite de l'utilisateur ; l'historique git du projet est déjà en français. |
| D-02 | 2026-11-17 | Aucune connexion au site de production avec les mots de passe de test publiés ; aucune suppression de données en prod sans accord explicite. | Sécurité et règle « actions irréversibles = confirmation ». Les vérifications prod se font en lecture seule (SQL `SELECT`). |
| D-03 | 2026-11-17 | 2FA obligatoire des comptes internes : **en attente de l'utilisateur** (il l'a désactivée le 2026-10-07 pour ses tests). Recommandation : la réactiver avant toute ouverture au public. | Choix qui change son usage quotidien → décision utilisateur. |
