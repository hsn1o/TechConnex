/*
  Warnings:

  - Added the required column `description` to the `Dispute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "DisputeStatus" ADD VALUE 'CLOSED';

-- DropForeignKey
ALTER TABLE "Dispute" DROP CONSTRAINT "Dispute_paymentId_fkey";

-- AlterTable
ALTER TABLE "Dispute" ADD COLUMN     "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "contestedAmount" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "milestoneId" UUID,
ADD COLUMN     "suggestedResolution" TEXT,
ALTER COLUMN "paymentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
