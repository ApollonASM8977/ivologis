-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('ENTREE', 'SORTIE');

-- CreateEnum
CREATE TYPE "TenantRequestType" AS ENUM ('RESILIATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "TenantRequestStatus" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REFUSEE');

-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "depositDeductions" JSONB,
ADD COLUMN     "depositRefund" DECIMAL(14,2),
ADD COLUMN     "depositSettledAt" TIMESTAMP(3),
ADD COLUMN     "rentRevisionDate" TIMESTAMP(3),
ADD COLUMN     "revisionRatePercent" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "type" "InspectionType" NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "rooms" JSONB NOT NULL,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_payouts" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owner_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leaseId" TEXT,
    "type" "TenantRequestType" NOT NULL,
    "status" "TenantRequestStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "effectiveDate" TIMESTAMP(3),
    "message" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "adminResponse" TEXT,
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspections_leaseId_idx" ON "inspections"("leaseId");

-- CreateIndex
CREATE INDEX "owner_payouts_ownerId_idx" ON "owner_payouts"("ownerId");

-- CreateIndex
CREATE INDEX "tenant_requests_tenantId_idx" ON "tenant_requests"("tenantId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_requests" ADD CONSTRAINT "tenant_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_requests" ADD CONSTRAINT "tenant_requests_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "leases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
