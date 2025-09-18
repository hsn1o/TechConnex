/*
  Warnings:

  - The values [WEB,MOBILE,IOT,CLOUD,AI,OTHER] on the enum `ServiceCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceCategory_new" AS ENUM ('web_development', 'mobile_app_development', 'cloud_services', 'iot_solutions', 'data_analytics', 'cybersecurity', 'ui_ux_design', 'devops', 'ai_ml_solutions', 'system_integration');
ALTER TABLE "ServiceRequest" ALTER COLUMN "category" TYPE "ServiceCategory_new" USING ("category"::text::"ServiceCategory_new");
ALTER TYPE "ServiceCategory" RENAME TO "ServiceCategory_old";
ALTER TYPE "ServiceCategory_new" RENAME TO "ServiceCategory";
DROP TYPE "ServiceCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "proposalId" UUID;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "ndaSigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "timeline" TEXT;

-- CreateTable
CREATE TABLE "Proposal" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "requestId" UUID NOT NULL,
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "deliveryTime" INTEGER NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
