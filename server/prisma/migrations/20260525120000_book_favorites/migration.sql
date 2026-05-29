-- CreateTable
CREATE TABLE "book_favorites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "book_favorites_user_id_book_id_key" ON "book_favorites"("user_id", "book_id");

-- CreateIndex
CREATE INDEX "book_favorites_user_id_created_at_idx" ON "book_favorites"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "book_favorites" ADD CONSTRAINT "book_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_favorites" ADD CONSTRAINT "book_favorites_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
