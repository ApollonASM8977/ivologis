-- CreateEnum
CREATE TYPE "LandTitleType" AS ENUM ('ACD', 'TITRE_FONCIER', 'LETTRE_ATTRIBUTION', 'ARRETE_CONCESSION', 'AUTRE');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "landTitleType" "LandTitleType",
ADD COLUMN     "landTitleVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "virtualTourUrl" TEXT;

