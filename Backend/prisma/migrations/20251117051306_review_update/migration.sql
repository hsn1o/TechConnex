/*
  Warnings:

  - You are about to drop the `ReviewVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReviewVote" DROP CONSTRAINT "ReviewVote_reviewId_fkey";

-- DropForeignKey
ALTER TABLE "ReviewVote" DROP CONSTRAINT "ReviewVote_userId_fkey";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "professionalism_rating" INTEGER;

-- DropTable
DROP TABLE "ReviewVote";
