-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'customer', 'user');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'user';
