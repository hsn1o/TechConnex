/*
  Warnings:

  - You are about to drop the column `logo_url` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `profileVideoUrl` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "logo_url";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "profileVideoUrl",
ADD COLUMN     "portfolioLinks" TEXT[];
