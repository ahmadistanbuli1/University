-- AlterEnum
ALTER TYPE "TranscriptRequestStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "transcript_requests" ADD COLUMN "rejection_reason" TEXT;
