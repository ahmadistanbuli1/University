-- CreateEnum
CREATE TYPE "StudyTerm" AS ENUM ('FIRST', 'SECOND');

-- CreateTable
CREATE TABLE "curriculum_courses" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "study_year" INTEGER NOT NULL,
    "term" "StudyTerm" NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "practical_pass" INTEGER NOT NULL DEFAULT 40,
    "theory_pass" INTEGER NOT NULL DEFAULT 60,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "curriculum_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_curriculum_grades" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "curriculum_course_id" UUID NOT NULL,
    "practical_score" DECIMAL(5,2),
    "theory_score" DECIMAL(5,2),

    CONSTRAINT "student_curriculum_grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_courses_code_key" ON "curriculum_courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_courses_department_id_study_year_term_code_key" ON "curriculum_courses"("department_id", "study_year", "term", "code");

-- CreateIndex
CREATE INDEX "curriculum_courses_department_id_study_year_term_idx" ON "curriculum_courses"("department_id", "study_year", "term");

-- CreateIndex
CREATE UNIQUE INDEX "student_curriculum_grades_student_id_curriculum_course_id_key" ON "student_curriculum_grades"("student_id", "curriculum_course_id");

-- AddForeignKey
ALTER TABLE "curriculum_courses" ADD CONSTRAINT "curriculum_courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_curriculum_grades" ADD CONSTRAINT "student_curriculum_grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_curriculum_grades" ADD CONSTRAINT "student_curriculum_grades_curriculum_course_id_fkey" FOREIGN KEY ("curriculum_course_id") REFERENCES "curriculum_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
