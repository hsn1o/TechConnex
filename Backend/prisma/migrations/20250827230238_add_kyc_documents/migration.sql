-- CreateEnum
CREATE TYPE "KycDocType" AS ENUM ('PROVIDER_ID', 'COMPANY_REG', 'COMPANY_DIRECTOR_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "KycDocStatus" AS ENUM ('uploaded', 'verified', 'rejected');

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "KycDocType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT,
    "status" "KycDocStatus" NOT NULL DEFAULT 'uploaded',
    "reviewNotes" TEXT,
    "reviewedBy" UUID,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KycDocument_userId_idx" ON "KycDocument"("userId");

-- CreateIndex
CREATE INDEX "KycDocument_type_idx" ON "KycDocument"("type");

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
