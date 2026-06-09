-- CreateEnum
CREATE TYPE "ClearanceRequestStatus" AS ENUM ('PENDING', 'DELIVERED', 'REJECTED');

-- AlterEnum
ALTER TYPE "NotificationKind" ADD VALUE 'CLEARANCE_REQUEST';
ALTER TYPE "NotificationKind" ADD VALUE 'CLEARANCE_READY';
ALTER TYPE "NotificationKind" ADD VALUE 'CLEARANCE_REJECTED';

-- CreateTable
CREATE TABLE "clearance_certificate_requests" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "status" "ClearanceRequestStatus" NOT NULL,
    "file_path" TEXT,
    "rejection_reason" TEXT,
    "fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "fee_paid" BOOLEAN NOT NULL DEFAULT false,
    "fee_refunded" BOOLEAN NOT NULL DEFAULT false,
    "payment_reference" TEXT,
    "paid_at" TIMESTAMP(3),
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "processed_by" UUID,

    CONSTRAINT "clearance_certificate_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clearance_certificate_requests" ADD CONSTRAINT "clearance_certificate_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clearance_certificate_requests" ADD CONSTRAINT "clearance_certificate_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
