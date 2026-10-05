-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

