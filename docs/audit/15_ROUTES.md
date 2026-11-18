# 15 — Routes de l'API : accès et appartenance (généré par `apps/api/scripts/routes-audit.mjs`)

141 routes. Les gardes s'appliquent côté serveur (JwtAuthGuard, RolesGuard, PermissionsGuard) ; le super-admin passe les permissions.

| Méthode | Route | Accès | Appartenance de la ressource | Limite |
|---|---|---|---|---|
| POST | `/api/analytics/pageview` | public | — (données publiques ou création anonyme) | 60/min |
| GET | `/api/analytics/summary` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| GET | `/api/audit-logs` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| POST | `/api/auth/2fa/disable` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/auth/2fa/enable` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/auth/2fa/mandatory-confirm` | public | — (données publiques ou création anonyme) | 10/min |
| POST | `/api/auth/2fa/mandatory-setup` | public | — (données publiques ou création anonyme) | 120/min (global) |
| POST | `/api/auth/2fa/setup` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/auth/forgot-password` | public | — (données publiques ou création anonyme) | 5/min |
| POST | `/api/auth/login` | public | — (données publiques ou création anonyme) | 5/min |
| POST | `/api/auth/logout` | public | — (données publiques ou création anonyme) | 120/min (global) |
| POST | `/api/auth/logout-all` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/auth/me` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/auth/register` | public | — (données publiques ou création anonyme) | 5/min |
| POST | `/api/auth/reset-link/:userId` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| POST | `/api/auth/reset-password` | public | — (données publiques ou création anonyme) | 10/min |
| GET | `/api/auth/sessions` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| DELETE | `/api/auth/sessions/:id` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/catalog/rentals` | public | — (données publiques ou création anonyme) | 120/min (global) |
| GET | `/api/catalog/rentals/:id` | public | — (données publiques ou création anonyme) | 120/min (global) |
| GET | `/api/catalog/sales` | public | — (données publiques ou création anonyme) | 120/min (global) |
| GET | `/api/catalog/sales/:id` | public | — (données publiques ou création anonyme) | 120/min (global) |
| GET | `/api/catalog/short-stay` | public | — (données publiques ou création anonyme) | 120/min (global) |
| GET | `/api/catalog/short-stay/:id` | public | — (données publiques ou création anonyme) | 120/min (global) |
| POST | `/api/contact-requests` | public | — (données publiques ou création anonyme) | 5/min |
| GET | `/api/contact-requests` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/contact-requests/:id` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| GET | `/api/files/:id` | public | — (données publiques ou création anonyme) | 120/min (global) |
| POST | `/api/files/sign` | tout compte connecté | vérifié : StorageService.authorizeDocument : agence, ou partie au document (propriétaire, locataire, auteur) | 120/min (global) |
| GET | `/api/leases` | SUPER_ADMIN, ADMIN_AGENT, OWNER, TENANT | périmètre limité à l'utilisateur connecté | 120/min (global) |
| POST | `/api/leases` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/leases/:id` | tout compte connecté | contrôle d'appartenance (scope.util) | 120/min (global) |
| PATCH | `/api/leases/:id` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/leases/:id/deposit-settlement` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/leases/:id/document` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/leases/:id/expiry-decision` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/leases/:id/inspections` | tout compte connecté | refus explicite si autre propriétaire | 120/min (global) |
| POST | `/api/leases/:id/inspections` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/leases/:id/inspections/compare` | tout compte connecté | refus explicite si autre propriétaire | 120/min (global) |
| POST | `/api/leases/:id/inspections/photo` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/leases/:id/renew` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/leases/:id/revision` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/leases/:id/terminate` | SUPER_ADMIN, ADMIN_AGENT + LEASES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/leases/expiries/due` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| GET | `/api/leases/revisions/due` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| GET | `/api/maintenance` | SUPER_ADMIN, ADMIN_AGENT, OWNER, TENANT | périmètre limité à l'utilisateur connecté | 120/min (global) |
| POST | `/api/maintenance` | TENANT | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/maintenance/:id` | tout compte connecté | refus explicite si autre propriétaire | 120/min (global) |
| PATCH | `/api/maintenance/:id` | SUPER_ADMIN, ADMIN_AGENT + MAINTENANCE_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/maintenance/:id/comments` | SUPER_ADMIN, ADMIN_AGENT, OWNER, TENANT | refus explicite si autre propriétaire ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/maintenance/photos` | TENANT | vérifié : envoi d'un nouveau fichier, aucune ressource existante (rattaché ensuite à la demande du locataire) | 20/min |
| PATCH | `/api/notifications/:id/read` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/notifications/me` | tout compte connecté | périmètre limité à l'utilisateur connecté ; requête filtrée sur l'utilisateur ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| PATCH | `/api/notifications/read-all` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/owners` | SUPER_ADMIN, ADMIN_AGENT + OWNERS_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/owners` | SUPER_ADMIN, ADMIN_AGENT + OWNERS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/owners/:id` | tout compte connecté | contrôle d'appartenance (scope.util) | 120/min (global) |
| PATCH | `/api/owners/:id` | SUPER_ADMIN, ADMIN_AGENT, OWNER | contrôle d'appartenance (scope.util) ; refus explicite si autre propriétaire | 120/min (global) |
| GET | `/api/owners/:id/balance` | SUPER_ADMIN, ADMIN_AGENT, OWNER | contrôle d'appartenance (scope.util) | 120/min (global) |
| POST | `/api/owners/:id/invite` | SUPER_ADMIN, ADMIN_AGENT + OWNERS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/owners/:id/payouts` | SUPER_ADMIN, ADMIN_AGENT, OWNER | contrôle d'appartenance (scope.util) | 120/min (global) |
| POST | `/api/owners/:id/payouts` | SUPER_ADMIN, ADMIN_AGENT + PAYMENTS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/owners/:id/revenue-summary` | tout compte connecté | contrôle d'appartenance (scope.util) | 120/min (global) |
| PATCH | `/api/owners/:id/status` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| GET | `/api/owners/me` | OWNER | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/payments` | SUPER_ADMIN, ADMIN_AGENT, OWNER, TENANT | requête filtrée sur l'utilisateur ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/payments` | SUPER_ADMIN, ADMIN_AGENT + PAYMENTS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/payments/:id` | tout compte connecté | contrôle d'appartenance (scope.util) | 120/min (global) |
| POST | `/api/payments/:id/confirm` | SUPER_ADMIN, ADMIN_AGENT + PAYMENTS_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/payments/:id/receipt` | SUPER_ADMIN, ADMIN_AGENT + PAYMENTS_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/payments/:id/reject` | SUPER_ADMIN, ADMIN_AGENT + PAYMENTS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/payments/export` | SUPER_ADMIN, ADMIN_AGENT, OWNER | requête filtrée sur l'utilisateur ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/payments/overdue` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre limité à l'utilisateur connecté | 120/min (global) |
| POST | `/api/payments/overdue/:leaseId/remind` | SUPER_ADMIN, ADMIN_AGENT + PAYMENTS_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/payments/pay-rent` | TENANT | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/properties` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/properties` | SUPER_ADMIN, ADMIN_AGENT, OWNER + PROPERTIES_MANAGE | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/properties/:id` | tout compte connecté | contrôle d'appartenance (scope.util) ; périmètre limité à l'utilisateur connecté ; refus explicite si autre propriétaire | 120/min (global) |
| PATCH | `/api/properties/:id` | SUPER_ADMIN, ADMIN_AGENT, OWNER + PROPERTIES_MANAGE | contrôle d'appartenance (scope.util) ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| DELETE | `/api/properties/:id` | SUPER_ADMIN, ADMIN_AGENT, OWNER + PROPERTIES_MANAGE | contrôle d'appartenance (scope.util) ; périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/properties/:id/images` | SUPER_ADMIN, ADMIN_AGENT, OWNER | contrôle d'appartenance (scope.util) | 120/min (global) |
| POST | `/api/properties/:propertyId/finalize-sale` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/properties/:propertyId/sale` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/properties/:propertyId/sale-document` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/properties/:propertyId/sale-documents` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/properties/:propertyId/sale-documents` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/properties/:propertyId/sale-offers` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/properties/:propertyId/sale-offers` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/properties/:propertyId/short-stay-bookings` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/properties/:propertyId/short-stay-bookings` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/properties/:propertyId/short-stay-bookings/request` | tout compte connecté | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 5/min |
| POST | `/api/properties/:propertyId/visit-requests` | tout compte connecté | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 5/min |
| GET | `/api/properties/:propertyId/visit-requests` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| DELETE | `/api/properties/images/:imageId` | SUPER_ADMIN, ADMIN_AGENT, OWNER | contrôle d'appartenance (scope.util) | 120/min (global) |
| GET | `/api/properties/me` | TENANT | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/reports/dashboard` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/reports/financial` | SUPER_ADMIN, ADMIN_AGENT + REPORTS_VIEW | — (agence uniquement) | 120/min (global) |
| GET | `/api/reports/owner/:id` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre limité à l'utilisateur connecté ; refus explicite si autre propriétaire | 120/min (global) |
| GET | `/api/reports/owner/:id/export` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre limité à l'utilisateur connecté ; refus explicite si autre propriétaire | 120/min (global) |
| GET | `/api/reports/property/:id` | SUPER_ADMIN, ADMIN_AGENT, OWNER | contrôle d'appartenance (scope.util) ; refus explicite si autre propriétaire | 120/min (global) |
| DELETE | `/api/sale-documents/:documentId` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/sale-offers/:offerId/accept` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/sale-offers/:offerId/refuse` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/sales` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/search` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| GET | `/api/settings` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/settings` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| GET | `/api/settings/public` | public | — (données publiques ou création anonyme) | 120/min (global) |
| PATCH | `/api/short-stay-bookings/:id/cancel` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/short-stay-bookings/:id/complete` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/short-stay-bookings/:id/confirm` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/short-stay-bookings/:id/mark-paid` | SUPER_ADMIN, ADMIN_AGENT + PROPERTIES_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/short-stay-bookings/:id/refuse` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| GET | `/api/short-stay-bookings/mine` | SUPER_ADMIN, ADMIN_AGENT, OWNER, TENANT | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/short-stay-bookings/upcoming` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/technicians` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| POST | `/api/technicians` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| POST | `/api/tenant-requests` | TENANT | périmètre limité à l'utilisateur connecté | 120/min (global) |
| GET | `/api/tenant-requests` | TENANT, SUPER_ADMIN, ADMIN_AGENT | périmètre limité à l'utilisateur connecté | 120/min (global) |
| PATCH | `/api/tenant-requests/:id` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| POST | `/api/tenant-requests/attachment` | TENANT | vérifié : envoi d'un nouveau fichier, aucune ressource existante (rattaché ensuite à la demande du locataire) | 120/min (global) |
| GET | `/api/tenants` | SUPER_ADMIN, ADMIN_AGENT, OWNER | périmètre limité à l'utilisateur connecté ; refus explicite si autre propriétaire ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/tenants` | SUPER_ADMIN, ADMIN_AGENT + TENANTS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/tenants/:id` | tout compte connecté | contrôle d'appartenance (scope.util) ; périmètre limité à l'utilisateur connecté ; refus explicite si autre propriétaire ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| PATCH | `/api/tenants/:id` | SUPER_ADMIN, ADMIN_AGENT, TENANT | contrôle d'appartenance (scope.util) ; refus explicite si autre propriétaire | 120/min (global) |
| POST | `/api/tenants/:id/invite` | SUPER_ADMIN, ADMIN_AGENT + TENANTS_MANAGE | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/tenants/:id/status` | SUPER_ADMIN, ADMIN_AGENT + TENANTS_MANAGE | — (agence uniquement) | 120/min (global) |
| POST | `/api/tenants/import` | SUPER_ADMIN, ADMIN_AGENT + TENANTS_MANAGE | — (agence uniquement) | 120/min (global) |
| GET | `/api/tenants/me` | TENANT | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/users` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/users/:id/permissions` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/users/:id/status` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| GET | `/api/users/admins` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| POST | `/api/users/admins` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/users/me` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| POST | `/api/users/me/avatar` | tout compte connecté | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |
| GET | `/api/users/permissions` | SUPER_ADMIN | — (agence uniquement) | 120/min (global) |
| GET | `/api/visit-requests` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/visit-requests/:id/confirm` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| PATCH | `/api/visit-requests/:id/refuse` | SUPER_ADMIN, ADMIN_AGENT | — (agence uniquement) | 120/min (global) |
| GET | `/api/visit-requests/mine` | SUPER_ADMIN, ADMIN_AGENT, OWNER, TENANT | périmètre limité à l'utilisateur connecté ; périmètre appliqué dans le service (vérifié : assertOwnsResource / ownerScope) | 120/min (global) |

## Points signalés (0)

Aucun.
