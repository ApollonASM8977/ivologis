# 12 — Audit écran par écran des espaces admin, propriétaire et locataire

Démarré le 2026-11-17 à la demande de l'utilisateur (« tu t'es limité au superficiel »). Méthode : environnement local + branche `audit-qa`, session de chaque rôle, pour chaque écran : rendu, textes suspects (`undefined`, `NaN`, `Invalid Date`, `[object Object]`, `null`, messages d'erreur), chargements bloqués, console, puis test des actions principales.

## Espace admin
| Écran | Rendu | Constats | Statut |
|---|---|---|---|
| Tableau de bord | OK (indicateurs, graphique revenus, actions rapides) | — | OK |
| Biens (liste, fiche) | OK | — | OK |
| Propriétaires (liste, fiche) | OK | — | OK |
| Locataires (liste, fiche) | OK | — | OK |
| Contrats (liste, fiche) | OK | — | OK |
| Paiements | OK | — | OK |
| Maintenance (liste, fiche) | OK | — | OK |
| Techniciens, Demandes locataires, Ventes, Courte durée, Demandes de démo, Statistiques | OK | — | OK |
| **Demandes du site public** | — | **A-01 (ÉLEVÉ)** : les demandes de visite (vente et location), de réservation et de contact envoyées par les visiteurs **ne déclenchaient aucune notification** et les visites n'étaient visibles qu'en ouvrant la fiche de chaque bien → prospects perdus. | **CORRIGÉ** : notification à toute l'équipe (`NotificationsService.notifyStaff`) + nouvelle page **« Demandes clients »** (`/admin/requests`) : onglets visites / réservations, filtres, appel et WhatsApp, confirmer/refuser, compteurs animés. Testé : demande invitée → notification + visible + confirmation OK ; locataire → 403. |

Faux positifs écartés : infobulle Recharts (`role=status`), copie invisible 0×0 laissée par la transition de page, compteurs animés lus avant la fin de l'animation (onglet en arrière-plan).

| **Maintenance (fiche)** | Rendu OK | **AD-01 (ÉLEVÉ)** : impossible d'enregistrer une demande sans choisir de technicien (« Aucun » envoyait `technicianId: ""` → erreur anglaise `technicianId must be a UUID`). Reproduit par l'API. | **CORRIGÉ** : « Aucun » = `null` (désassigne), coûts vides = `null`. Fil d'échanges animé partagé, photos cliquables, bouton d'appel du locataire, libellés reliés aux champs. |
| **Biens (fiche, partagée avec le propriétaire)** | Rendu OK | **PD-01 (MOYEN)** : « Archiver » agissait en un clic, sans confirmation. **PD-03 (MOYEN)** : on pouvait archiver un bien ayant un bail en cours (bien suspendu, locataire toujours rattaché). | **CORRIGÉS** : fenêtre de confirmation qui explique l'effet ; l'API refuse l'archivage tant qu'un bail est actif. |

## Espace locataire (2026-11-17)
| Écran | Constats | Statut |
|---|---|---|
| Tableau de bord, Mon logement, Mon contrat, Résiliation & demandes, Réservations, Profil | Rendu OK, aucun texte suspect | OK |
| Tableau de bord, Mon logement, Paiements | **L-01 (MOYEN)** : le loyer affiché venait de la fiche du bien alors que la déclaration enregistre le loyer **du bail** ; après une révision de loyer, le locataire voyait l'ancien montant. | **CORRIGÉ** : loyer du bail partout. |
| Paiements | **L-02 (MOYEN)** : le bouton « Déclarer un paiement » restait proposé alors que le mois était déjà réglé ou en vérification (refus de l'API ensuite) ; un paiement refusé par l'agence n'affichait pas le motif ; montant affiché deux fois dans la fenêtre. | **CORRIGÉ** : bandeau d'état du mois (réglé / en vérification avec la référence), bouton masqué dans ces cas, motif du refus sous le statut, fenêtre simplifiée avec le mois concerné. |
| Maintenance | **M-01 (ÉLEVÉ)** : aucune photo possible (le champ existait en base mais rien pour l'envoyer) ; le locataire ne pouvait ni ouvrir sa demande, ni lire les réponses, ni écrire à l'agence. **M-02 (ÉLEVÉ)** : les nouvelles demandes ne prévenaient que les super admins, pas les agents. **M-03** : un message du locataire ou du propriétaire ne prévenait pas l'agence. **M-04** : le locataire n'était prévenu qu'à la résolution, pas à la prise en charge. **M-05 (sécurité, FAIBLE)** : `photos` acceptait n'importe quelle URL (ex. lien externe de pistage affiché à l'agence). | **CORRIGÉS** : envoi de 5 photos max (`POST /maintenance/photos`, JPG/PNG/WebP 5 Mo, limité à 20/min), fiche de suivi `/tenant/maintenance/[id]` (étapes animées, intervenant, note de l'agence, fil d'échanges), notification de toute l'équipe (« URGENT » si urgente), notification de l'agence à chaque message, notification du locataire à chaque changement de statut ou d'intervenant, validation stricte des photos (`/api/files/<uuid>` uniquement, 5 max), messages limités à 2 000 caractères. Testé par l'API : URL externe → 400 « Photo invalide. », envoi → 201, création urgente → notification « URGENT », message → notification agence, prise en charge → notification locataire. |

## Espace propriétaire (2026-11-17)
| Écran | Constats | Statut |
|---|---|---|
| Tableau de bord, Paiements, Contrats, Relevé financier, Maintenance (liste + fiche), Catalogue, Profil, fiche locataire | Rendu OK | OK |
| **Mes locataires** | **O-01 (ÉLEVÉ)** : la page était **toujours vide** : l'API exigeait la permission « gestion des locataires » (réservée au personnel) et répondait 403, que la page affichait comme « Aucune donnée ». | **CORRIGÉ** : un propriétaire voit toujours ses propres locataires (liste déjà filtrée par propriétaire) ; la permission reste exigée des agents. Vérifié : Yao Patrick / Villa Riviera 3 / Actif. |
| Mes biens | **O-02 (MOYEN)** : « 0 FCFA/mois » affiché pour un bien en vente ou un terrain ; cartes sans photo ni animation. | **CORRIGÉ** : prix selon l'usage (loyer, prix de vente, nuitée, sinon « Prix à définir avec l'agence »), photo de couverture, locataire actuel, squelettes de chargement, apparition en cascade et survol animé. |
| Fiche bien | **O-03 (MOYEN)** : « Modifier » et « Archiver » proposés à un propriétaire sans autorisation (403 au clic). | **CORRIGÉ** : boutons affichés seulement avec le droit correspondant. |

## À poursuivre (prochain lot)
- Admin, actions en profondeur : création de bien → bail → paiement → quittance → relevé propriétaire ; import CSV ; paramètres ; équipe et permissions.
- **Question produit (A-03)** : la page « Mon logement » du locataire affiche le nom et le téléphone du propriétaire. En gestion par agence, le locataire passe normalement par l'agence. Garder, masquer ou remplacer par le contact de l'agence ? (décision utilisateur)
- Sécurité **S-17 (FAIBLE)** : les images (photos de biens, de maintenance, pièces jointes image des demandes locataires) sont servies sans signature, protégées seulement par un identifiant aléatoire non devinable. Une pièce d'identité envoyée en JPG dans une demande serait lisible par quiconque obtient le lien. Piste : signer aussi les images non publiques.
- **Question produit (A-02)** : un propriétaire voit le nom et le téléphone des visiteurs qui demandent à visiter son bien (`GET /properties/:id/visit-requests`), ce qui permet de contourner l'agence. Masquer ces coordonnées au propriétaire ? (décision utilisateur)
