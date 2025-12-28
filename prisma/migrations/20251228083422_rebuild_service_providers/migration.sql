-- AlterTable
ALTER TABLE "service_providers" ADD COLUMN     "accountType" TEXT,
ALTER COLUMN "portfolioImages" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "service_providers_verificationStatus_idx" ON "service_providers"("verificationStatus");
