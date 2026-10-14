-- AlterTable
ALTER TABLE "property_visit_requests" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "guestPhone" TEXT,
ADD COLUMN     "reference" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "short_stay_bookings" ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "reference" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "property_visit_requests_reference_key" ON "property_visit_requests"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "short_stay_bookings_reference_key" ON "short_stay_bookings"("reference");

