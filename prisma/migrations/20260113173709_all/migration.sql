/*
  Warnings:

  - Added the required column `coverImageId` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "coverImageId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "product_media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
