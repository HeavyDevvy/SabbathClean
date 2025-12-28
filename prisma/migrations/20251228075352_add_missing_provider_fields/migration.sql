-- AlterTable
ALTER TABLE "service_providers" ADD COLUMN     "experience" TEXT,
ADD COLUMN     "idDocument" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "proofOfAddress" TEXT,
ADD COLUMN     "qualificationCertificate" TEXT,
ADD COLUMN     "servicesOffered" TEXT[] DEFAULT ARRAY[]::TEXT[];
