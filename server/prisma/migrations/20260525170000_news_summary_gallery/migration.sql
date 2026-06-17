-- Add summary column and gallery images table for rich news articles.

ALTER TABLE "news" ADD COLUMN "summary" TEXT;

UPDATE "news"
SET "summary" = LEFT("content", 280)
WHERE "summary" IS NULL;

ALTER TABLE "news" ALTER COLUMN "summary" SET NOT NULL;

CREATE TABLE "news_images" (
    "id" UUID NOT NULL,
    "news_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "news_images_news_id_idx" ON "news_images"("news_id");

ALTER TABLE "news_images" ADD CONSTRAINT "news_images_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;
