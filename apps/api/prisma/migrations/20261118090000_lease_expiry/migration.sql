-- Échéance des baux (AD-06) : décision de l'agence et suivi des alertes 90/60/30 jours.
ALTER TABLE "leases" ADD COLUMN "autoRenewMonths" INTEGER,
ADD COLUMN "expiryNoticeDays" INTEGER;
