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

Faux positifs écartés : infobulle Recharts (`role=status`), copie invisible 0×0 laissée par la transition de page.

## À poursuivre (prochain lot)
- Espaces **propriétaire** et **locataire** : même parcours écran par écran + actions (déclaration de paiement, maintenance, demande de résiliation, relevé, documents).
- Admin, actions en profondeur : création de bien → bail → paiement → quittance → maintenance → relevé propriétaire ; import CSV ; paramètres ; équipe et permissions.
- **Question produit (A-02)** : un propriétaire voit le nom et le téléphone des visiteurs qui demandent à visiter son bien (`GET /properties/:id/visit-requests`), ce qui permet de contourner l'agence. Masquer ces coordonnées au propriétaire ? (décision utilisateur)
