-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;


-- Les annonces de démonstration créées en nov. 2026 sont les seules illustrées par des photos Unsplash.
UPDATE "properties" SET "isDemo" = true WHERE "id" IN (SELECT DISTINCT "propertyId" FROM "property_images" WHERE "url" LIKE 'https://images.unsplash.com/%');
