-- Mesure d'audience interne, anonyme (C1-17) : aucune adresse IP, aucun cookie, aucun identifiant de personne.
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "referrerHost" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");
