/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeRefundId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeTransferId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `users` table. All the data in the column will be lost.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_amount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'TRANSFERRED';
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "stripeRefundId",
DROP COLUMN "stripeTransferId",
ADD COLUMN     "bank_transfer_date" TIMESTAMP(3),
ADD COLUMN     "bank_transfer_ref" TEXT,
ADD COLUMN     "bank_transfer_status" TEXT,
ADD COLUMN     "escrowed_at" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "platform_fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "provider_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "release_scheduled_for" TIMESTAMP(3),
ADD COLUMN     "released_at" TIMESTAMP(3),
ADD COLUMN     "stripe_charge_id" TEXT,
ADD COLUMN     "stripe_payment_intent_id" TEXT,
ADD COLUMN     "stripe_refund_id" TEXT,
ADD COLUMN     "stripe_transfer_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripeAccountId",
ADD COLUMN     "bank_account_name" TEXT,
ADD COLUMN     "bank_account_number" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "bank_swift_code" TEXT;

-- CreateTable
CREATE TABLE "platform_fee_configs" (
    "id" UUID NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "fixedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxAmount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_fee_configs_pkey" PRIMARY KEY ("id")
);
