-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Certification_issuer_idx" ON "Certification"("issuer");

-- CreateIndex
CREATE INDEX "Certification_serialNumber_idx" ON "Certification"("serialNumber");
