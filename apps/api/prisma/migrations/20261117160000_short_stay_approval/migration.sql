-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "shortStayApproved" BOOLEAN NOT NULL DEFAULT false;


-- Les séjours déjà publiés l'ont été par l'agence : ils restent visibles.
UPDATE "properties" SET "shortStayApproved" = true WHERE "shortStayEnabled" = true;
