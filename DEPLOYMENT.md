# Deployment Guide

## Why deploys are manual

This repo is private and hosted on Vercel's free Hobby plan. Vercel's Hobby
plan only auto-deploys commits authored by the project owner — any commit
authored by a teammate (even after merge to `main`) is marked **Blocked**
and never goes live.

Until we upgrade to Vercel Pro or make the repo public, every deploy after
a teammate's PR is merged has to be done manually by the project owner
(Abdullah).

## Steps to deploy after a merge

1. Pull the latest `main` locally:

```
   git checkout main
   git pull origin main
```

2. Re-author the latest commit(s) as the project owner so Vercel will
   accept them:

```
   git commit --amend --author="Abdullah Berro <aboudiberro33@gmail.com>" --no-edit
   git push --force origin main
```

   *(If multiple teammate commits landed since the last deploy, re-author
   each one, or squash them into a single commit authored by the owner
   before pushing.)*

3. Deploy to production:

```
   vercel --prod
```

## How to verify the deploy actually worked

The Vercel CLI saying "Ready" is not enough — it only means the build
succeeded, not that the app works.

1. Open the live URL: https://techtalks-skillproof.vercel.app
2. Do a real end-to-end check: sign up a test account, sign in, confirm
   you land on the correct role home page, sign out.
3. Check it on an actual phone, not just desktop — layout and auth flow
   have both broken at phone width before.
4. If anything looks off, check the Vercel deployment logs before
   assuming it's a code bug — Prisma client generation has silently been
   skipped on a fresh deploy before (fixed by adding `prisma generate`
   explicitly to the build script).

## Known gotchas

- **Prisma client not generated on deploy** — build script must explicitly
  run `prisma generate` before `next build`, since Vercel doesn't always
  infer it.
- **bcrypt native builds** — this project uses `bcryptjs` (pure JS)
  instead of `bcrypt`, specifically to avoid native-module build failures
  on Vercel.
