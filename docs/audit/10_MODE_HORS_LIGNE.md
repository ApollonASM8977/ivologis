# 10 — Mode hors ligne et synchronisation (conception, 2026-11-17)

Statut : **réflexion, rien n'est implémenté**. Objectif : pouvoir continuer à travailler et à enregistrer quand internet coupe, puis synchroniser au retour, sans perte ni doublon.

## 1. Qui en a besoin, pour quoi faire
| Utilisateur | Situation typique | Besoin hors ligne |
|---|---|---|
| Agent sur le terrain | Visite, état des lieux, quartier mal couvert | Remplir un état des lieux avec photos, noter un paiement en espèces, créer un dossier locataire |
| Agence au bureau | Coupure réseau ou de fibre | Consulter baux, locataires, impayés ; enregistrer des paiements |
| Locataire | Data épuisée | Voir son bail et ses quittances, préparer une demande de maintenance |
| Visiteur | Connexion lente | Revoir les annonces déjà consultées |

## 2. Approche recommandée : application web « offline-first » (PWA), pas de logiciel à installer
On part de l'existant (Next.js + service worker `public/sw.js` déjà en place) plutôt que d'un logiciel de bureau.

**Lecture hors ligne**
- Les données déjà consultées sont gardées sur l'appareil (TanStack Query persisté dans IndexedDB) : listes, fiches, baux, quittances déjà ouvertes.
- Bandeau visible : « Hors ligne — données du JJ/MM à HH:MM ».

**Écriture hors ligne : une file d'attente locale (« outbox »)**
1. Chaque action (ex. « enregistrer un paiement ») est d'abord écrite dans une file IndexedDB avec un **identifiant unique généré sur l'appareil** (UUID), l'heure et l'auteur.
2. L'interface l'affiche aussitôt avec le statut « En attente de synchronisation ».
3. Au retour du réseau (événement `online`, ouverture de l'application, ou Background Sync sur Android), la file est rejouée **dans l'ordre**.
4. Le serveur utilise l'identifiant unique comme **clé d'idempotence** : rejouer deux fois la même action ne crée jamais de doublon.
5. Résultat par action : synchronisé ✓, refusé (avec le message du serveur) ou **conflit** (voir 3).

**Photos (états des lieux, maintenance)** : compressées sur l'appareil, stockées dans IndexedDB, envoyées après la donnée qu'elles illustrent.

## 3. Règles de cohérence (le point délicat)
- **Créations** (paiement, demande, état des lieux, dossier) : pas de conflit possible grâce à l'identifiant unique.
- **Modifications** : chaque enregistrement porte une version (`updatedAt`). Si le serveur a changé entre-temps, on ne remplace pas en silence : l'action passe en « conflit » et un humain choisit.
- **Argent** : un paiement saisi hors ligne reste `PENDING` ; la **quittance n'est émise qu'après validation serveur** (même règle qu'en ligne, cf. P0-02). Le numéro de quittance est toujours attribué par le serveur.
- **Actions interdites hors ligne** : confirmer un paiement, émettre une quittance, signer ou résilier un bail, publier une annonce, gérer les comptes (elles exigent l'état serveur à jour).

## 4. Sécurité des données gardées sur l'appareil
- IndexedDB n'est pas chiffré : on ne garde **ni pièces d'identité, ni revenus, ni coordonnées bancaires** hors ligne ; seulement ce qui sert au travail courant.
- Tout est effacé à la déconnexion ; durée de conservation limitée (ex. 7 jours).
- Si la session expire pendant la coupure, la file attend une nouvelle connexion (jamais d'envoi anonyme).

## 5. Alternatives écartées (pour l'instant)
| Option | Pourquoi pas maintenant |
|---|---|
| Logiciel de bureau (Tauri/Electron + SQLite) | Installation et mises à jour sur chaque poste, double code ; à reconsidérer si les bureaux subissent des coupures longues et fréquentes |
| Serveur local au bureau (mini-PC + base répliquée) | Réplication bidirectionnelle complexe, maintenance matérielle |
| Base locale synchronisée clé en main (PouchDB/CouchDB, ElectricSQL, PowerSync…) | Changerait l'architecture de données ; à évaluer si les besoins hors ligne s'étendent à tout le back-office |

## 6. Découpage proposé (à ajouter au backlog P2)
| ID | Étape | Effort |
|---|---|---|
| P2-13 | Lecture hors ligne : persistance du cache TanStack Query + bandeau « hors ligne » | M |
| P2-14 | File d'attente + idempotence serveur pour 3 actions : paiement espèces (PENDING), demande de maintenance, état des lieux avec photos | L |
| P2-15 | Écran « synchronisation » : en attente / synchronisé / refusé / conflit, résolution manuelle | M |
| P2-16 | Tests : coupure en pleine saisie, double rejeu, session expirée, photo volumineuse sur 3G | M |

## 7. Questions pour l'utilisateur
1. Quelles actions sont vraiment indispensables hors ligne (liste ci-dessus à valider) ?
2. Les coupures sont-elles surtout de quelques minutes/heures, ou de plusieurs jours ? (Au-delà de quelques jours, l'option logiciel de bureau devient pertinente.)
3. Sur quels appareils travaillent les agents (Android d'entrée de gamme, PC du bureau) ?
