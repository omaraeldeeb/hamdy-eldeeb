/*
  Warnings:

  - You are about to drop the column `sessionId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `payment` on the `User` table. All the data in the column will be lost.
  - Added the required column `sessionCartId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "sessionId",
ADD COLUMN     "sessionCartId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "payment",
ADD COLUMN     "paymentMethod" TEXT;
