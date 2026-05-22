-- AlterTable: departments — stable code + group description
ALTER TABLE "departments" ADD COLUMN "code" TEXT;
ALTER TABLE "departments" ADD COLUMN "description" TEXT;

UPDATE "departments" SET "code" = 'LEGACY_' || LEFT(REPLACE("id"::text, '-', ''), 8) WHERE "code" IS NULL;

ALTER TABLE "departments" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- AlterTable: students — academic year cohort
ALTER TABLE "students" ADD COLUMN "academic_year" TEXT;

UPDATE "students" SET "academic_year" = '2025-2026' WHERE "academic_year" IS NULL;

ALTER TABLE "students" ALTER COLUMN "academic_year" SET NOT NULL;
