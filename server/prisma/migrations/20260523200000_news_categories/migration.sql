-- Replace NewsCategory enum: GENERAL -> ANNOUNCEMENT, add WORKSHOP & TRAINING
ALTER TYPE "NewsCategory" RENAME TO "NewsCategory_old";

CREATE TYPE "NewsCategory" AS ENUM ('ANNOUNCEMENT', 'WORKSHOP', 'TRAINING', 'TUITION');

ALTER TABLE "news" ALTER COLUMN "category" DROP DEFAULT;

ALTER TABLE "news"
  ALTER COLUMN "category" TYPE "NewsCategory"
  USING (
    CASE "category"::text
      WHEN 'GENERAL' THEN 'ANNOUNCEMENT'::"NewsCategory"
      WHEN 'TUITION' THEN 'TUITION'::"NewsCategory"
      ELSE 'ANNOUNCEMENT'::"NewsCategory"
    END
  );

ALTER TABLE "news" ALTER COLUMN "category" SET DEFAULT 'ANNOUNCEMENT';

DROP TYPE "NewsCategory_old";
