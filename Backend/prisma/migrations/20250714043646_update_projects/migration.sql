/*
  Warnings:

  - You are about to drop the column `serviceRequestId` on the `Project` table. All the data in the column will be lost.
  - Added the required column `budgetMax` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budgetMin` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_serviceRequestId_fkey";

-- DropIndex
DROP INDEX "Project_serviceRequestId_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "serviceRequestId",
ADD COLUMN     "budgetMax" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "budgetMin" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "category" "ServiceCategory" NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "projectId" UUID;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
