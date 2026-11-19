-- P1-09 : verification fonciere documentee (piece archivee, date, verificateur).
-- AlterEnum
ALTER TYPE "SaleDocumentType" ADD VALUE 'DOCUMENT_FONCIER';

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "landTitleDocumentId" TEXT,
ADD COLUMN     "landTitleVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "landTitleVerifiedBy" TEXT;
