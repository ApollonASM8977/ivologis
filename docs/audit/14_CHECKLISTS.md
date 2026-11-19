# 14 — Checklists obligatoires (AGENTS.md) — état au 2026-11-18

Chaque point est vérifié et prouvé (commande, test, sortie). ✅ fait et prouvé · 🟡 fait, une action de l'utilisateur reste · ➖ non applicable (raison + équivalent).

## Checklist 1 — Site web prêt à publier

| # | Point | État | Preuve / remarque |
|---|---|---|---|
| 1 | Politique de confidentialité | ✅ | `/confidentialite` FR/EN ; mise à jour : langue, mesure d'audience anonyme, refus possible. |
| 2 | Conditions générales | 🟡 | `/conditions-generales` FR/EN créée (pied de page, sitemap, robots). **À faire valider par un juriste.** |
| 3 | Aucune clé secrète côté navigateur | ✅ | Le site ne lit que `NEXT_PUBLIC_API_URL` et `NEXT_PUBLIC_SITE_URL` (adresses publiques). Recherche de motifs secrets (`postgres://`, `JWT_SECRET`, `sk_`, clés AWS, jetons) dans tout le JavaScript envoyé : aucun résultat. Dépôt : seuls des `.env.example` à valeurs factices. 🟡 Confirmer que le `JWT_SECRET` de Render n'est pas la valeur d'exemple. |
| 4 | HTTPS forcé + HSTS | ✅ | `http://` → 301 `https://` (site et API) ; `strict-transport-security` présent sur les deux. |
| 5 | Bandeau cookies | ✅ | Seulement des cookies techniques ; bandeau d'information avec refus de la mesure d'audience (`components/audience.tsx`). |
| 6 | Favicon | ✅ | `/favicon.ico` (16/32/48 px), `/icon`, `/apple-icon`, manifeste bilingue. |
| 7 | sitemap.xml / robots.txt | ✅ | Pages publiques uniquement ; espaces et API interdits aux robots. |
| 8 | Textes alternatifs | ✅ | Robot `site-audit.cjs` : 0 image sans `alt` sur 47 pages × 4 rôles. |
| 9 | Images compressées | ✅ | Affichage : `next/image` (WebP/AVIF, tailles adaptées). Envoi : réduites à 2000 px, WebP, **métadonnées GPS retirées**, faux fichiers rejetés (test unitaire). |
| 10 | Vitesse | 🟡 | Linux, mobile, médiane de 5 (version du dépôt, après bandeau et mesure d'audience) : accueil 97, connexion 96, CGU 98, locations 95, ventes 94, fiche 94. Ordinateur (Linux, médiane de 3, run `44336732776`) : **100** sur les 6 pages mesurées (détail `08_QA_CHECKLIST.md`). **Prod, mobile, après le lot sécurité** (run `44425634399`, médiane de 5) : accueil 98, locations 99, fiche 99, sécurité 97, connexion 100 (ventes et CGU non mesurées). Le bandeau n'apparaît qu'au premier geste (sinon il devenait l'élément LCP). Prochain levier pour le catalogue : filtres traités par le serveur sans React Query. Le plan gratuit Render endort le site (~50 s au premier visiteur) : instance payante recommandée. |
| 11 | Contrastes | ✅ | Lighthouse accessibilité 100 sur les pages publiques. |
| 12 | Mobile | ✅ | Robot à 390 px : aucun défilement horizontal sur aucune page des 4 rôles. |
| 13 | Page 404 personnalisée | ✅ | `app/[lang]/not-found.tsx`, bilingue (langue du cookie), maison animée, retour accueil/catalogue. |
| 14 | Liens cassés | ✅ | Robot : 85 liens internes vérifiés avec les droits de chaque rôle, 0 cassé. |
| 15 | Validation des formulaires | ✅ | Navigateur : messages sous les champs des formulaires publics, message général sur les formulaires internes ; serveur : schémas stricts (voir C2-4). |
| 16 | Anti-spam | ✅ | Champ piège (contact, visite, réservation) + limites de débit (5/min sur les formulaires publics). |
| 17 | Mesure d'audience | ✅ | Interne, sans cookie ni IP (`/api/analytics`), carte « Audience du site » dans Statistiques. |
| 18 | Un seul appel à l'action | ✅ | Accueil : « Demander une démo » seul bouton principal ; le lien sécurité est devenu un lien texte. |
| 19 | Multilingue | 🟡 | Interface 100 % (vérificateur `check:i18n` en CI + robot 64 pages × 2 langues). Annonces : nom/description traduits par DeepL **dès que la clé `DEEPL_API_KEY` est ajoutée sur Render** (sinon saisie manuelle dans la fiche). |

## Checklist 2 — Sécurité (« 7 prompts »)

| # | Point | État | Preuve / remarque |
|---|---|---|---|
| 1 | Secrets | 🟡 | API : `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `PORT`, `NODE_ENV`, `DEEPL_API_KEY` (serveur uniquement). Navigateur : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL` (publics). Déjà commités : mots de passe des comptes de test (S-01) → à changer à la fin des tests (D-06) ; aucune clé réelle dans l'historique. |
| 2 | Appartenance | ✅ | `15_ROUTES.md` (généré par `apps/api/scripts/routes-audit.mjs`) : 141 routes, rôle et contrôle d'appartenance pour chacune, 0 point ouvert. Aucune route client ne lit un `userId`/`ownerId`/`tenantId` dans la requête. Corrigé : `GET /settings` (taux de commission, modèles) réservé à l'agence. |
| 3 | Règles de base de données | ➖ | Neon + Prisma, pas Supabase : RLS désactivé sur les 30 tables, mais la base n'est pas exposée (pas d'API de données publique) et seul le rôle de l'application s'y connecte. Équivalent : contrôle dans l'API à chaque requête, prouvé par C2-7 et `test/qa-securite.mjs`. À revoir si une API de données Neon est un jour activée (RLS obligatoire alors). |
| 4 | Assignation de masse | ✅ | `ValidationPipe` global `whitelist` + `forbidNonWhitelisted` : tout champ inconnu → 400 « Champ non autorisé ». Corrigé : 5 routes qui lisaient un champ isolé sans schéma (statut propriétaire/locataire, demande traitée, import, photo de couverture). Champs jamais modifiables par un client : rôle, statut, permissions, `ownerId`/`tenantId` d'un autre, `isDemo`, publication, vérification du titre, montant d'un loyer déclaré. |
| 5 | Paiements | ➖ | Pas de paiement en ligne. Montants : loyer déclaré = loyer du bail (serveur) ; demande de séjour = tarif du bien × nuits (serveur) ; montants libres réservés à l'agence. Le jour où Paystack/CinetPay est branché : vérifier la signature de chaque webhook (HMAC). |
| 6 | Limites de débit | ✅ | Global 120/min/IP ; connexion 5/min ; inscription 5/min ; mot de passe oublié 5/min ; réinitialisation 10/min ; double authentification (activation, désactivation, confirmation) 10/min ; formulaires publics 5/min ; mesure d'audience 60/min ; création/modification de bien (traduction payante) 30/min. Au-delà : 429 « Trop de tentatives. Patientez une minute puis réessayez. » (traduit en anglais). |
| 7 | Preuve A/B | ✅ | `apps/api/test/qa-ab.mjs` (base de test, refuse la prod) : comptes B créés par le vrai parcours d'invitation ; 16/16 tentatives de B (lire, modifier, supprimer, commenter la demande de A ; lire, modifier, archiver le bien de A ; lire le bail de A) → 403/404 ; A lit les siens → 200. |

## Règle « dépôts externes »
- `sharp@0.35.5` (compression d'images) : dépôt officiel lovell/sharp, licence Apache-2.0, aucun script d'installation automatique, 3 dépendances, binaires `@img/*` officiels, version de septembre 2026.
- Skiper UI, Magic UI, Cult UI : voir le compte rendu de la session (inspection avant tout usage).
