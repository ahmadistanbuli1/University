-- CreateEnum
CREATE TYPE "ManagerRequestStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationKind" ADD VALUE 'MANAGER_REQUEST';
ALTER TYPE "NotificationKind" ADD VALUE 'MANAGER_REQUEST_RESOLVED';

-- DropForeignKey
ALTER TABLE "books" DROP CONSTRAINT "books_department_id_fkey";

-- CreateTable
CREATE TABLE "manager_requests" (
    "id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ManagerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "admin_response" TEXT,
    "resolved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "manager_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manager_requests_status_created_at_idx" ON "manager_requests"("status", "created_at");

-- AddForeignKey
ALTER TABLE "manager_requests" ADD CONSTRAINT "manager_requests_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_requests" ADD CONSTRAINT "manager_requests_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "student_tuition_installments_student_id_academic_year_semester_" RENAME TO "student_tuition_installments_student_id_academic_year_semes_key";
