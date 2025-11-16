-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "requirements" DROP NOT NULL,
ALTER COLUMN "requirements" DROP DEFAULT,
ALTER COLUMN "requirements" SET DATA TYPE TEXT,
ALTER COLUMN "deliverables" DROP NOT NULL,
ALTER COLUMN "deliverables" DROP DEFAULT,
ALTER COLUMN "deliverables" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "service_requests" ALTER COLUMN "requirements" DROP NOT NULL,
ALTER COLUMN "requirements" DROP DEFAULT,
ALTER COLUMN "requirements" SET DATA TYPE TEXT,
ALTER COLUMN "deliverables" DROP NOT NULL,
ALTER COLUMN "deliverables" DROP DEFAULT,
ALTER COLUMN "deliverables" SET DATA TYPE TEXT;
