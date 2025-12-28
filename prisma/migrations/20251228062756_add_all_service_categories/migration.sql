/*
  Warnings:

  - The values [CATERING,PHOTOGRAPHY,VENUE,ENTERTAINMENT,DECORATION] on the enum `ServiceCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ServiceCategory_new" AS ENUM ('HOUSE_CLEANING', 'PLUMBING_SERVICES', 'ELECTRICAL_SERVICES', 'GARDEN_CARE', 'POOL_CLEANING_MAINTENANCE', 'CHEF_CATERING', 'WAITERING_SERVICES', 'MOVING_SERVICES', 'AU_PAIR_SERVICES', 'LOCKSMITH_SERVICES', 'OTHER');
ALTER TABLE "service_providers" ALTER COLUMN "category" TYPE "ServiceCategory_new" USING ("category"::text::"ServiceCategory_new");
ALTER TYPE "ServiceCategory" RENAME TO "ServiceCategory_old";
ALTER TYPE "ServiceCategory_new" RENAME TO "ServiceCategory";
DROP TYPE "public"."ServiceCategory_old";
COMMIT;
