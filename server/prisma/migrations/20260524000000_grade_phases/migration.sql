-- Grade submission two-phase workflow (practical then theory)

CREATE TYPE "GradeSubmissionPhase" AS ENUM ('PRACTICAL', 'THEORY');

ALTER TYPE "NotificationKind" ADD VALUE 'PRACTICAL_GRADE_PUBLISHED';

ALTER TABLE "grade_submissions"
  ADD COLUMN "phase" "GradeSubmissionPhase" NOT NULL DEFAULT 'PRACTICAL',
  ADD COLUMN "practical_published_at" TIMESTAMP(3);

ALTER TABLE "grade_submission_lines"
  ALTER COLUMN "theory_score" DROP NOT NULL;

UPDATE "curriculum_courses" SET "practical_pass" = 16 WHERE "practical_pass" = 40;
