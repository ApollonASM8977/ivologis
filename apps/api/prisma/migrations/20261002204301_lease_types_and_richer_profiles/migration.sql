-- CreateEnum
CREATE TYPE "LeaseType" AS ENUM ('HABITATION_NUE', 'HABITATION_MEUBLEE', 'COMMERCIAL', 'PROFESSIONNEL', 'TERRAIN');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('CELIBATAIRE', 'MARIE', 'DIVORCE', 'VEUF');

-- AlterTable
ALTER TABLE "leases" ADD COLUMN     "details" JSONB,
ADD COLUMN     "type" "LeaseType" NOT NULL DEFAULT 'HABITATION_NUE',
ADD COLUMN     "wordUrl" TEXT;

-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "nationality" TEXT DEFAULT 'Ivoirienne',
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "rccmNumber" TEXT,
ADD COLUMN     "secondaryPhone" TEXT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "floor" INTEGER,
ADD COLUMN     "furnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landmark" TEXT,
ADD COLUMN     "yearBuilt" INTEGER;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "employer" TEXT,
ADD COLUMN     "guarantorAddress" TEXT,
ADD COLUMN     "guarantorIdDocument" TEXT,
ADD COLUMN     "guarantorName" TEXT,
ADD COLUMN     "guarantorPhone" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "monthlyIncome" DECIMAL(14,2),
ADD COLUMN     "nationality" TEXT DEFAULT 'Ivoirienne',
ADD COLUMN     "placeOfBirth" TEXT;
