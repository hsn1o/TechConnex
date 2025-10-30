/*
  Warnings:

  - You are about to drop the column `attachmentUrl` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "attachmentUrl",
ADD COLUMN     "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
