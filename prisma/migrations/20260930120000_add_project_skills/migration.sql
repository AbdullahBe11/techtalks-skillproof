-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
