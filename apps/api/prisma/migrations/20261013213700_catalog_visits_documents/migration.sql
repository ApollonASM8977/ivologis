-- CreateEnum
CREATE TYPE "VisitRequestStatus" AS ENUM ('EN_ATTENTE', 'CONFIRME', 'REFUSE', 'TERMINE');

-- CreateEnum
CREATE TYPE "SaleDocumentType" AS ENUM ('MUTATION', 'CONTRAT', 'RECU', 'PREUVE_PAIEMENT', 'ACTE', 'AUTRE');

-- AlterEnum
ALTER TYPE "ShortStayStatus" ADD VALUE 'EN_ATTENTE';

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "inquiryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "short_stay_bookings" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "requestedByUserId" TEXT;

-- CreateTable
CREATE TABLE "property_visit_requests" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT,
    "preferredDate" TIMESTAMP(3),
    "scheduledDate" TIMESTAMP(3),
    "status" "VisitRequestStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_visit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_sale_documents" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "SaleDocumentType" NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_sale_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_visit_requests_propertyId_idx" ON "property_visit_requests"("propertyId");

-- CreateIndex
CREATE INDEX "property_visit_requests_userId_idx" ON "property_visit_requests"("userId");

-- CreateIndex
CREATE INDEX "property_sale_documents_propertyId_idx" ON "property_sale_documents"("propertyId");

-- AddForeignKey
ALTER TABLE "property_visit_requests" ADD CONSTRAINT "property_visit_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_visit_requests" ADD CONSTRAINT "property_visit_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_sale_documents" ADD CONSTRAINT "property_sale_documents_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
