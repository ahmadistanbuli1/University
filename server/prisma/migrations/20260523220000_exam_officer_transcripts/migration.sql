-- Exam officer role and transcript payment workflow
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EXAM_OFFICER';

ALTER TYPE "TranscriptRequestStatus" ADD VALUE IF NOT EXISTS 'AFFAIRS_APPROVED';

ALTER TABLE "transcript_requests" ADD COLUMN IF NOT EXISTS "fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 5;
ALTER TABLE "transcript_requests" ADD COLUMN IF NOT EXISTS "fee_paid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "transcript_requests" ADD COLUMN IF NOT EXISTS "fee_refunded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "transcript_requests" ADD COLUMN IF NOT EXISTS "payment_reference" TEXT;
ALTER TABLE "transcript_requests" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);
ALTER TABLE "transcript_requests" ADD COLUMN IF NOT EXISTS "affairs_reviewed_at" TIMESTAMP(3);

UPDATE "transcript_requests"
SET "fee_paid" = true
WHERE "status" IN ('PENDING', 'DELIVERED', 'REJECTED', 'PROCESSED');
