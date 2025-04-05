/*
  Warnings:

  - A unique constraint covering the columns `[nameAr]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slugAr]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slugAr]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slugAr]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "descriptionAr" TEXT DEFAULT '',
ADD COLUMN     "nameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "slugAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "descriptionAr" TEXT DEFAULT '',
ADD COLUMN     "nameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "slugAr" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "discount" DECIMAL(5,2),
ADD COLUMN     "isLimitedTimeOffer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nameAr" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "slugAr" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Brand_nameAr_key" ON "Brand"("nameAr");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slugAr_key" ON "Brand"("slugAr");

-- CreateIndex
CREATE INDEX "Brand_nameAr_idx" ON "Brand"("nameAr");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slugAr_key" ON "Category"("slugAr");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_ar_idx" ON "Product"("slugAr");

-- CreateIndex
CREATE INDEX "Product_isLimitedTimeOffer_idx" ON "Product"("isLimitedTimeOffer");

-- CreateIndex
CREATE INDEX "Product_isNewArrival_idx" ON "Product"("isNewArrival");

-- CreateIndex
CREATE INDEX "Product_discount_idx" ON "Product"("discount");
