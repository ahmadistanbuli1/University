-- Add author, publisher, and graduation-project category
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "author" TEXT;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "publisher" TEXT;

ALTER TYPE "LibraryBookCategory" ADD VALUE IF NOT EXISTS 'GRADUATION_PROJECT';
