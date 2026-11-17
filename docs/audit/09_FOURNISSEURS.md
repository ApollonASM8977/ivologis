# 09 — Fournisseurs externes : comparatif et recommandation

Recherche du 2026-11-17. Les prix changent : **revérifier sur la page tarifaire officielle avant de s'engager**. Conversion indicative : 1 USD ≈ 600 FCFA (taux variable ; 1 EUR = 655,957 FCFA fixe).

## Prérequis commun : un nom de domaine
Un domaine (`ivologis.ci` ou `.com`) est nécessaire pour envoyer des emails fiables (SPF/DKIM : impossible depuis `onrender.com`), pour l'image de marque et pour régler S-08 (cookie de session sécurisé partagé entre site et API). Prix : non vérifié ici, à demander au registraire. **À faire en premier.**

## 1. Email transactionnel (mot de passe oublié, accusés de demande, confirmations)
| | Brevo (recommandé) | Resend (alternative) |
|---|---|---|
| Gratuit | 300 emails/jour (≈ 9 000/mois), sans report des jours non utilisés | 3 000 emails/mois, 100/jour |
| Payant | Starter dès 9 $/mois (≈ 5 400 FCFA) à partir de 5 000 emails | Pro 20 $/mois (≈ 12 000 FCFA) pour 50 000 emails |
| Points forts | Société française, interface en français ; SMS et WhatsApp sur la même plateforme pour la suite | API très simple, pensée pour les développeurs |
| Limites | Mention « Sent with Brevo » sur l'offre gratuite (campagnes) | Plafond mensuel bas en gratuit |
**Pourquoi Brevo** : notre volume de départ tient largement dans le gratuit, et c'est le seul des deux qui permettra d'ajouter **SMS/WhatsApp** (canal principal en Côte d'Ivoire) sans changer de fournisseur. Coût au démarrage : **0 FCFA**.
Sources : [comparatif Courier](https://www.courier.com/integrations/compare/brevo-vs-resend), [Brevo vs Resend (Brevo)](https://www.brevo.com/resend/), [freetier.co 2026](https://freetier.co/articles/free-email-sending-tiers-2026).

## 2. Paiement Mobile Money / carte (agrégateur)
| | Paystack | CinetPay |
|---|---|---|
| Grille publique officielle | **Oui** : Côte d'Ivoire 1,95 % mobile money, 3,2 % carte locale (hors TVA) | Non trouvée ; blogs : ≈ 3 % + 50 FCFA (mobile money), ≈ 3,2-3,5 % carte |
| Exemple sur un loyer de 150 000 FCFA | ≈ 2 925 FCFA + TVA | ≈ 4 550 FCFA (estimation non officielle) |
| Opérateurs | À vérifier dans le tableau de bord (Wave, Orange, MTN, Moov) | Orange, MTN, Moov, Wave cités partout |
| Remarques | Filiale de Stripe, API et webhooks signés très documentés | Acteur régional historique (UEMOA) ; incidents de cyberfraude signalés en sept. 2025 |
**Recommandation** : ouvrir un compte **test (sandbox) chez Paystack** en premier (moins cher et prix publics), vérifier que **Wave et Orange Money** sont couverts (les plus utilisés par les locataires, à confirmer). Si un opérateur indispensable manque, CinetPay en complément. Pas d'abonnement mensuel annoncé : on paie à la transaction (à confirmer au contrat). **Décision à prendre : qui paie les frais (agence, locataire, ou intégrés au loyer).**
Sources : [Paystack, tarification (support)](https://support.paystack.com/fr/articles/3039746), [Kolonell, CinetPay 2026 (blog commercial)](https://kolonell.com/fr/blog/cinetpay-integration-tarifs-commissions-cote-ivoire-2026), [TechCabal](https://techcabal.com/fr/?p=179865).

## 3. Stockage des photos et documents
| | Cloudflare R2 (recommandé) |
|---|---|
| Gratuit | 10 Go de stockage, 1 M opérations d'écriture et 10 M de lecture par mois, **sortie de données gratuite** |
| Au-delà | ≈ 0,015 $/Go/mois (≈ 9 FCFA/Go/mois, chiffre tiers à confirmer) |
| Pourquoi | Pas de frais de bande passante (les visiteurs téléchargent beaucoup de photos), compatible S3 (migration de `StorageService` localisée), et libère la base Neon limitée à 1 Go |
Ordre de grandeur : 10 Go ≈ 20 000 photos compressées à 500 Ko → gratuit.
Sources : [Cloudflare R2, pricing (doc officielle)](https://developers.cloudflare.com/r2/pricing/), [Filebase 2026](https://filebase.com/blog/cloudflare-r2-pricing-costs-savings-and-alternatives-in-2026/).

## 4. Hébergement (rappel)
Render gratuit : mise en veille après inactivité, réveil jusqu'à ~1 min. Passer au moins l'API en offre payante (Starter, environ 7 $/mois par service selon nos constats précédents, à reconfirmer) avant l'ouverture au public.

## Budget mensuel de démarrage (estimation)
| Poste | Coût |
|---|---|
| Email (Brevo gratuit) | 0 FCFA |
| Stockage (R2 gratuit jusqu'à 10 Go) | 0 FCFA |
| Paiement | % par transaction uniquement |
| Hébergement Render (2 services Starter) | ≈ 14 $ ≈ 8 400 FCFA |
| Domaine | prix annuel à vérifier |

## Ce dont j'ai besoin de toi pour intégrer
1. Le domaine (et l'accès DNS) → email Brevo + cookie sécurisé.
2. Compte Brevo → clé API (à mettre dans les variables Render, jamais dans le code).
3. Compte Paystack **en mode test** → clés de test + liste des opérateurs proposés.
4. Compte Cloudflare → bucket R2 + clés d'accès.
