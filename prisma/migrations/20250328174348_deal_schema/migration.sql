-- CreateTable
CREATE TABLE "Deal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "targetDate" TIMESTAMP(6) NOT NULL,
    "startDate" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deal_isActive_idx" ON "Deal"("isActive");

-- CreateIndex
CREATE INDEX "Deal_targetDate_idx" ON "Deal"("targetDate");

-- CreateIndex
CREATE INDEX "Deal_startDate_idx" ON "Deal"("startDate");
