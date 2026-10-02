-- TS-58: candidate headline and profile links (all optional)
ALTER TABLE "profiles" ADD COLUMN "headline" TEXT;
ALTER TABLE "profiles" ADD COLUMN "github_url" TEXT;
ALTER TABLE "profiles" ADD COLUMN "linkedin_url" TEXT;
ALTER TABLE "profiles" ADD COLUMN "portfolio_url" TEXT;
