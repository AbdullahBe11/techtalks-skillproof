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

2. Re-author the latest commit as the project owner, locally only —
   **do not push this.** `vercel --prod` deploys straight from your local
   files, not from GitHub, so there's never a need to push the re-authored
   commit anywhere:

```
   git commit --amend --author="Abdullah Berro <aboudiberro33@gmail.com>" --no-edit
```

   *(If multiple teammate commits landed since the last deploy, amending
   the latest one is enough — Vercel only checks the author of the commit
   it's building.)*

3. Build locally first, to catch errors before deploying:

```
   npm run build
```

4. Deploy to production:

```
   npx vercel --prod
```

5. Reset your local branch back to the real, unmodified history — the
   amend from step 2 was local-only and should not stick around:

```
   git reset --hard origin/main
```

**Do not `git push --force` to `main` at any point in this process.**
Force-pushing rewrites shared history that teammates have already pulled
and will break their local repos. It is never necessary here — the whole
point of amending only locally is that nothing needs to be pushed.

## Applying database migrations

There is currently no automated migration step in the build or deploy
pipeline — `next build` only runs `prisma generate` (which regenerates the
Prisma client from `schema.prisma`), it does **not** apply any pending
migrations to the database.

This project has one shared Postgres database (Neon), used by both local
development and production — there is no separate staging/prod database.
That means migrations must be applied deliberately, not left to `next dev`
or `next build` to handle implicitly.

To apply pending migrations to the shared database:

```
npx prisma migrate deploy
```

**Use `migrate deploy`, never `migrate dev`, against the shared database.**
`migrate dev` is for local development only — it can prompt for a reset,
diverge from the committed migration history, and was the root cause of a
real production incident this sprint (TS-28): a migration file with a
UTF-8 BOM plus a `migrate dev` run against the shared database left Neon's
applied-migrations table out of sync with the repo, silently. `migrate
deploy` is non-interactive and only ever applies migrations that are
already committed to the repo in order — safe to run against a database
other people are also using.

Apply pending migrations **before** deploying the code that depends on
them, so the API doesn't briefly serve requests against a schema it
doesn't expect yet.

## Approving a verifier account

Verifier is **not** available at sign-up (UI or API). People request access by
email, the team reviews their credentials and background, and only then does
someone with database access promote the account. This stops a candidate from
verifying their own work.

All of these run in the Neon SQL Editor against the shared database, so every
change is live immediately.

1. **Ask the requester to sign up normally** and confirm their email. A
   recruiter account is cleanest, since it has no projects.

2. **Find the account and check it is ready:**

```
   SELECT id, name, email, role, email_verified_at
   FROM users WHERE email = 'person@example.com';
```

   `email_verified_at` must not be empty.

3. **Check the account owns no projects.** Verifiers can review any project, so
   an account with its own projects must not be promoted (ask for a separate
   email instead):

```
   SELECT COUNT(*) FROM projects p
   JOIN profiles pr ON pr.id = p.profile_id
   WHERE pr.user_id = '<id from step 2>';
```

   The result must be `0`.

4. **Promote the account** (use the id, not the email, to avoid typos):

```
   UPDATE users SET role = 'verifier'
   WHERE id = '<id from step 2>' AND role <> 'admin'
   RETURNING id, email, role;
```

5. **Tell them to sign out and sign back in.** The role is stored in their
   session at sign-in, so the change only applies after a fresh login.

6. **Record the approval** (who approved, when, and why) in the team's usual
   channel.

### Removing verifier access

```
UPDATE users SET role = 'candidate' WHERE id = '<id>' RETURNING id, email, role;
```

Projects they already verified keep their `verified_by_id`, so review those
before deciding whether to re-open them.

### Reviewing existing verifiers

```
SELECT u.id, u.name, u.email, u.created_at, COUNT(p.id) AS projects_verified
FROM users u
LEFT JOIN projects p ON p.verified_by_id = u.id
WHERE u.role = 'verifier'
GROUP BY u.id
ORDER BY u.created_at;
```

Compare the list against who the team actually approved. Downgrade anyone who
was not approved with the "Removing verifier access" query.

## How to verify the deploy actually worked

The Vercel CLI saying "Ready" is not enough — it only means the build
succeeded, not that the app works, and this project has a history of
deployments looking successful without actually being live.

1. Open the live URL: https://techtalks-skillproof.vercel.app
2. Do a real end-to-end check: sign up a test account, sign in, confirm
   you land on the correct role home page, sign out.
3. If the change touched the database, hit an endpoint that depends on
   the new/changed field and confirm it returns real data (not a 500) —
   don't just confirm the page loads.
4. Check it on an actual phone, not just desktop — layout and auth flow
   have both broken at phone width before.
5. If anything looks off, check the Vercel deployment logs before
   assuming it's a code bug — Prisma client generation has silently been
   skipped on a fresh deploy before (fixed by adding `prisma generate`
   explicitly to the build script).

## New environment variables (sprint 3)

None. Sprint 3's schema changes (project verification status + reviewer
feedback, TS-28/TS-29) only added columns to an existing table — no new
service, secret, or config value was introduced.

## New public routes (sprint 3)

None merged yet. TS-32 (public home page), TS-33 (public candidate
profile), and TS-34 (public project search) will add unauthenticated
public routes once merged — **this section needs updating when those
land**, since public routes are a different deployment consideration
(no auth check, so more exposure, and worth double-checking they don't
leak unverified/draft data).

## Known gotchas

- **Prisma client not generated on deploy** — build script must explicitly
  run `prisma generate` before `next build`, since Vercel doesn't always
  infer it.
- **bcrypt native builds** — this project uses `bcryptjs` (pure JS)
  instead of `bcrypt`, specifically to avoid native-module build failures
  on Vercel.
- **Migrations are not applied automatically** — see "Applying database
  migrations" above. Forgetting this step means new code can ship while
  the database is still on the old schema.