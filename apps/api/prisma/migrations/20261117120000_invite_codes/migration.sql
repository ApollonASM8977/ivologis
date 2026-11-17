-- AlterTable
ALTER TABLE "owners" ADD COLUMN     "inviteCodeHash" TEXT,
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "inviteCodeHash" TEXT,
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "owners_inviteCodeHash_key" ON "owners"("inviteCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_inviteCodeHash_key" ON "tenants"("inviteCodeHash");

