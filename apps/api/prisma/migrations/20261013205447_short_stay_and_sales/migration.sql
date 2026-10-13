-- CreateEnum
CREATE TYPE "ShortStayStatus" AS ENUM ('CONFIRMEE', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('DISPONIBLE', 'OFFRE_RECUE', 'SOUS_COMPROMIS', 'VENDU');

-- CreateEnum
CREATE TYPE "SaleOfferStatus" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "forSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleBuyerName" TEXT,
ADD COLUMN     "saleBuyerPhone" TEXT,
ADD COLUMN     "saleCommissionRate" DECIMAL(5,2),
ADD COLUMN     "saleDate" TIMESTAMP(3),
ADD COLUMN     "saleDocumentUrl" TEXT,
ADD COLUMN     "saleFinalPrice" DECIMAL(14,2),
ADD COLUMN     "salePrice" DECIMAL(14,2),
ADD COLUMN     "saleStatus" "SaleStatus" NOT NULL DEFAULT 'DISPONIBLE',
ADD COLUMN     "shortStayEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortStayNightlyRate" DECIMAL(14,2);

-- CreateTable
CREATE TABLE "short_stay_bookings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "nightlyRate" DECIMAL(14,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "depositAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "ShortStayStatus" NOT NULL DEFAULT 'CONFIRMEE',
    "notes" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "short_stay_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_sale_offers" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerPhone" TEXT,
    "offerAmount" DECIMAL(14,2) NOT NULL,
    "status" "SaleOfferStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_sale_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "short_stay_bookings_propertyId_idx" ON "short_stay_bookings"("propertyId");

-- CreateIndex
CREATE INDEX "short_stay_bookings_ownerId_idx" ON "short_stay_bookings"("ownerId");

-- CreateIndex
CREATE INDEX "short_stay_bookings_tenantId_idx" ON "short_stay_bookings"("tenantId");

-- CreateIndex
CREATE INDEX "short_stay_bookings_checkIn_idx" ON "short_stay_bookings"("checkIn");

-- CreateIndex
CREATE INDEX "short_stay_bookings_checkOut_idx" ON "short_stay_bookings"("checkOut");

-- CreateIndex
CREATE INDEX "property_sale_offers_propertyId_idx" ON "property_sale_offers"("propertyId");

-- CreateIndex
CREATE INDEX "properties_forSale_idx" ON "properties"("forSale");

-- CreateIndex
CREATE INDEX "properties_shortStayEnabled_idx" ON "properties"("shortStayEnabled");

-- AddForeignKey
ALTER TABLE "short_stay_bookings" ADD CONSTRAINT "short_stay_bookings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_stay_bookings" ADD CONSTRAINT "short_stay_bookings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "short_stay_bookings" ADD CONSTRAINT "short_stay_bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_sale_offers" ADD CONSTRAINT "property_sale_offers_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
