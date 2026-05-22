-- CreateEnum
CREATE TYPE "LibraryBookCategory" AS ENUM (
  'MEDICAL',
  'ADMINISTRATIVE',
  'SCIENTIFIC',
  'PROGRAMMING',
  'FRONTEND_WEB',
  'BACKEND_WEB',
  'ARTIFICIAL_INTELLIGENCE'
);

-- AlterTable
ALTER TABLE "books" ADD COLUMN "category" "LibraryBookCategory" NOT NULL DEFAULT 'SCIENTIFIC';
ALTER TABLE "books" ALTER COLUMN "department_id" DROP NOT NULL;

-- Map existing rows (engineering CS book -> programming)
UPDATE "books" SET "category" = 'PROGRAMMING' WHERE "title" ILIKE '%algorithm%';
