-- CreateEnum
CREATE TYPE "NotificationKind" AS ENUM (
  'NEWS',
  'TRANSCRIPT_REQUEST',
  'TRANSCRIPT_READY',
  'TRANSCRIPT_REJECTED',
  'APPEAL_SUBMITTED',
  'APPEAL_RESOLVED',
  'DISCOUNT_REQUEST',
  'DISCOUNT_RESOLVED',
  'GRADE_PUBLISHED'
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "NotificationKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link_path" TEXT NOT NULL,
    "meta" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_created_at_idx" ON "notifications"("user_id", "read", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
