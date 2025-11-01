-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "revision_number" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "submission_history" JSONB;
