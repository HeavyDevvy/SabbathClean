/*
  Warnings:

  - A unique constraint covering the columns `[bookingReference]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bookingReference" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "keyType" TEXT,
ADD COLUMN     "lockType" TEXT,
ADD COLUMN     "locksmithCategory" TEXT,
ADD COLUMN     "locksmithServiceType" TEXT,
ADD COLUMN     "numberOfDoors" INTEGER,
ADD COLUMN     "numberOfLocks" INTEGER,
ADD COLUMN     "vehicleMake" TEXT,
ADD COLUMN     "vehicleModel" TEXT,
ADD COLUMN     "vehicleYear" TEXT;

-- AlterTable
ALTER TABLE "service_providers" ADD COLUMN     "policeClearance" TEXT,
ADD COLUMN     "referenceDocument" TEXT,
ADD COLUMN     "specializations" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'INDIVIDUAL',
ADD COLUMN     "businessAddress" TEXT,
ADD COLUMN     "businessCity" TEXT,
ADD COLUMN     "businessCountry" TEXT DEFAULT 'South Africa',
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessPostalCode" TEXT,
ADD COLUMN     "businessRegistrationNumber" TEXT,
ADD COLUMN     "contactPersonEmail" TEXT,
ADD COLUMN     "contactPersonFirstName" TEXT,
ADD COLUMN     "contactPersonLastName" TEXT,
ADD COLUMN     "contactPersonPhone" TEXT,
ADD COLUMN     "contactPersonRole" TEXT,
ADD COLUMN     "vatNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingReference_key" ON "bookings"("bookingReference");
