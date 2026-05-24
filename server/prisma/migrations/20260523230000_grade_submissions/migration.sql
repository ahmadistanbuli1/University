-- Grade submission workflow (faculty → exam officer → students)
CREATE TYPE "GradeSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PUBLISHED', 'REJECTED');

ALTER TYPE "NotificationKind" ADD VALUE IF NOT EXISTS 'GRADE_SUBMISSION';
ALTER TYPE "NotificationKind" ADD VALUE IF NOT EXISTS 'GRADE_SUBMISSION_REJECTED';

CREATE TABLE "grade_submissions" (
    "id" UUID NOT NULL,
    "faculty_course_id" UUID NOT NULL,
    "faculty_id" UUID NOT NULL,
    "status" "GradeSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "submitted_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "published_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "grade_submissions_faculty_course_id_key" ON "grade_submissions"("faculty_course_id");
CREATE INDEX "grade_submissions_status_idx" ON "grade_submissions"("status");
CREATE INDEX "grade_submissions_faculty_id_idx" ON "grade_submissions"("faculty_id");

CREATE TABLE "grade_submission_lines" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "practical_score" DECIMAL(5,2) NOT NULL,
    "theory_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "grade_submission_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "grade_submission_lines_submission_id_student_id_key" ON "grade_submission_lines"("submission_id", "student_id");

ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_faculty_course_id_fkey" FOREIGN KEY ("faculty_course_id") REFERENCES "faculty_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "grade_submissions" ADD CONSTRAINT "grade_submissions_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "grade_submission_lines" ADD CONSTRAINT "grade_submission_lines_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "grade_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "grade_submission_lines" ADD CONSTRAINT "grade_submission_lines_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
