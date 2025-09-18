-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deliverables" TEXT,
ADD COLUMN     "requirements" TEXT;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "deliverables" JSONB,
ADD COLUMN     "requirements" JSONB;
