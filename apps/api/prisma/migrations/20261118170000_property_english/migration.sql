-- Contenu des annonces en anglais (D-14) : traduction automatique du nom et de la description.
ALTER TABLE "properties" ADD COLUMN "nameEn" TEXT,
ADD COLUMN "descriptionEn" TEXT;
