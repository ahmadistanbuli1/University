-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('GENERAL', 'TUITION');
CREATE TYPE "TuitionInstallmentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID');
CREATE TYPE "DiscountRequestType" AS ENUM ('MARTYR_RELATIVE', 'ACADEMIC_EXCELLENCE', 'HUMANITARIAN');
CREATE TYPE "DiscountRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable news
ALTER TABLE "news" ADD COLUMN "category" "NewsCategory" NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "news" ADD COLUMN "enable_pay_now" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "college_tuition_configs" (
    "id" UUID NOT NULL,
    "college_id" UUID NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "semester_amount" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "college_tuition_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "college_tuition_configs_college_id_key" ON "college_tuition_configs"("college_id");

CREATE TABLE "student_tuition_installments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "academic_year" TEXT NOT NULL,
    "semester_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount_due" DECIMAL(10,2) NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "TuitionInstallmentStatus" NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "student_tuition_installments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_tuition_installments_student_id_academic_year_semester_key_key" ON "student_tuition_installments"("student_id", "academic_year", "semester_key");

CREATE TABLE "tuition_payments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "installment_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reference_code" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'SIMULATED',
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tuition_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tuition_payments_reference_code_key" ON "tuition_payments"("reference_code");

CREATE TABLE "discount_requests" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "type" "DiscountRequestType" NOT NULL,
    "notes" TEXT,
    "proof_file_path" TEXT,
    "status" "DiscountRequestStatus" NOT NULL DEFAULT 'PENDING',
    "discount_percent" DECIMAL(5,2),
    "discount_amount" DECIMAL(10,2),
    "admin_response" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    CONSTRAINT "discount_requests_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "college_tuition_configs" ADD CONSTRAINT "college_tuition_configs_college_id_fkey" FOREIGN KEY ("college_id") REFERENCES "colleges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "student_tuition_installments" ADD CONSTRAINT "student_tuition_installments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tuition_payments" ADD CONSTRAINT "tuition_payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tuition_payments" ADD CONSTRAINT "tuition_payments_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "student_tuition_installments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discount_requests" ADD CONSTRAINT "discount_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
