-- Bilingue (D-14) : langue de l'utilisateur pour ses notifications et ses quittances.
ALTER TABLE "users" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'fr';
