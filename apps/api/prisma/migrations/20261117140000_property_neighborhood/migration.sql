-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "neighborhood" TEXT;


-- Riviera est un quartier de Cocody, pas une commune du District d'Abidjan.
UPDATE "properties" SET "neighborhood" = 'Riviera', "commune" = 'Cocody' WHERE "commune" = 'Riviera';

-- Assinie (sous-préfecture d'Assinie-Mafia) est hors du District d'Abidjan.
UPDATE "properties" SET "city" = 'Assinie-Mafia' WHERE "commune" = 'Assinie' AND "city" = 'Abidjan';
