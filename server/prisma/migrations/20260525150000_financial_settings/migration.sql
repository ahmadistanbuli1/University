-- University-wide service fees + per-college per-study-year tuition
CREATE TABLE "university_financial_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "transcript_fee" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "clearance_fee" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_financial_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "college_study_year_tuitions" (
    "id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "study_year" INTEGER NOT NULL,
    "annual_amount" DECIMAL(10,2) NOT NULL,
    "semester_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "college_study_year_tuitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "college_study_year_tuitions_college_id_study_year_key" ON "college_study_year_tuitions"("college_id", "study_year");

ALTER TABLE "college_study_year_tuitions" ADD CONSTRAINT "college_study_year_tuitions_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "university_financial_settings" ("id", "transcript_fee", "clearance_fee", "updated_at")
VALUES ('default', 5, 15, CURRENT_TIMESTAMP);

-- Seed study-year tuition from existing college configs (or defaults)
INSERT INTO "college_study_year_tuitions" ("id", "college_id", "study_year", "annual_amount", "semester_amount")
SELECT
    gen_random_uuid(),
    c."id",
    y."study_year",
    COALESCE(cfg."total_amount", CASE WHEN c."name" ILIKE '%Pharmaceutical%' THEN 1500 ELSE 1000 END),
    COALESCE(cfg."semester_amount", CASE WHEN c."name" ILIKE '%Pharmaceutical%' THEN 750 ELSE 500 END)
FROM "colleges" c
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS y("study_year")
LEFT JOIN "college_tuition_configs" cfg ON cfg."college_id" = c."id"
ON CONFLICT ("college_id", "study_year") DO NOTHING;
