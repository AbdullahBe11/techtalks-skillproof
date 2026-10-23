# SkillProof 🚀

> **Bridging the trust gap in software hiring through verified, human-reviewed project profiles.**

🌐 **Live app:** https://techtalks-skillproof.vercel.app

## 📌 Project Overview

**SkillProof** is a web platform for the Lebanese tech ecosystem that replaces unverified CVs with **verified project profiles**.

Candidates (students and recent graduates) add the projects they built, with evidence such as repository links and live demos. An approved, **named verifier** reviews the actual work and marks each project as verified or not. Recruiters then search verified candidates by skill and reach out directly.

Built during the **TechTalks internship (Next.js track)**.

---

## ✨ Features

### Candidates
- Create projects with skills and evidence links (repo, demo, docs)
- Publish or withdraw projects, and see each verification result and feedback
- Profile with headline, bio and links (CV, GitHub, LinkedIn, portfolio)
- Public profile page showing verified projects: **"Verified by [name] · [date]"**
- "Interested recruiters" page, plus an email when a recruiter shows interest
- Email when a project is verified or rejected
- Delete a project (with its evidence and verification)

### Verifiers
- Review queue of pending projects that have evidence
- Score each project on a 4-criterion rubric (functionality, code quality, documentation, ownership), then approve or reject with written feedback
- Can't verify their own projects; verifier accounts are approved by the team (no public sign-up)

### Recruiters
- Browse and search verified candidates by skill, name, headline or bio (flexible matching, e.g. "nextjs" finds "Next.js")
- Express interest, which unlocks the candidate's contact email
- Shortlist candidates and manage them from a "My shortlist" page

### Accounts & security
- Sign up as candidate or recruiter, with email verification
- Forgot password / reset by email link
- Verification resets automatically when a project's content or evidence changes
- Evidence links limited to http(s) to protect verifiers
- Privacy policy and terms pages, linked from sign-up and the footer

### Interface
- Light and dark mode with a header toggle (follows the device setting by default)
- Responsive layout for mobile and desktop

### Out of scope for V1
- AI-assisted grading, employer challenges, payments, automated matching

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 16 (App Router, API routes) + React + TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) via Prisma 5 |
| Authentication | NextAuth v5 (credentials, JWT sessions) |
| Email | Nodemailer (SMTP) |
| Testing | Vitest + ESLint, run in GitHub Actions CI on every PR |
| Deployment | Vercel |
| Project management | Jira (Scrum, weekly sprints) |

---

## 👥 Team & Responsibilities

| Name | Role / Focus Area |
|------|------------------|
| **Abdullah Mohammad Berro** | Team Lead / Planning / Frontend / Backend |
| **Abdallah Ahmad Khodor** | Backend Engineering |
| **Ali Bakri** | Frontend Engineering |
| **Jaafar Ali Khsheish** | Database Architecture |
| **Jamila Hallal** | Database Architecture |
| **Youssef Dawoud** | Frontend Engineering (early sprints) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20.9`
- npm
- Git
- A PostgreSQL database (we use [Neon](https://neon.tech))

### Clone and install

```bash
git clone https://github.com/AbdullahBe11/techtalks-skillproof.git
cd techtalks-skillproof
npm install
```

### Environment variables

Create a `.env` file from the example and fill in your own values:

```bash
cp .env.example .env
```

| Variable | What it is |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for signing sessions |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `APP_URL` | Public URL used in email links (required in production) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | SMTP settings for emails (optional locally; emails are skipped and logged if not set) |

> ⚠️ Never commit passwords, API keys, tokens, or database credentials.

### Set up the database

```bash
npx prisma migrate deploy
```

> ⚠️ Our local and production environments currently share **one** database. Never run `prisma migrate dev` or `prisma migrate reset` against it, and never answer "yes" to a reset prompt. See [DEPLOYMENT.md](./DEPLOYMENT.md).

### Run the app

```bash
npm run dev
```

Open http://localhost:3000.

### Checks (same as CI)

```bash
npm run lint
npm test
npm run build
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for how to deploy to production, including why deploys are manual on this repo.

# 🔄 Contribution Workflow

We use a **task branch → commit → pull request → peer review → merge** workflow.

This workflow helps the team work independently while keeping the `main` branch stable and reducing merge conflicts.

---

## 🌿 1. Task Branches

Do **not** work directly on `main`.

Every task or feature must have its own branch.

First, get the latest version of `main`:

```bash
git checkout main
git pull origin main
```

Create a branch for your task:

```bash
git checkout -b feature/your-task-name
```

### Branch Naming

```text
feature/feature-name
fix/bug-name
docs/documentation-name
```

### Examples

```bash
git checkout -b feature/candidate-profile
```

```bash
git checkout -b feature/database-verification
```

```bash
git checkout -b feature/recruiter-dashboard
```

```bash
git checkout -b fix/login-validation
```

> Each branch should focus on **one task or feature**.

---

## 📝 2. Meaningful Commits

Make small, focused commits that clearly describe the changes.

### ✅ Good Commit Messages

```text
Add candidate profile component
Create project verification table
Add recruiter filtering API
Fix authentication validation
Update database relationships
Add candidate verification endpoint
```

### ❌ Avoid

```text
update
changes
stuff
test
final
fix
```

A commit should represent **one logical change whenever possible**.

---

## 📤 3. Push Your Branch

After completing your changes:

```bash
git status
```

Add your changes:

```bash
git add .
```

Commit your changes:

```bash
git commit -m "Add project verification table"
```

Push your branch:

```bash
git push -u origin feature/database-verification
```

> ⚠️ Never push directly to `main`.

---

## 🔀 4. Pull Requests

When your task is complete, open a **Pull Request (PR)** on GitHub.

```text
feature/database-verification
              ↓
        Pull Request
              ↓
             main
```

Before opening the PR, make sure your branch is up to date:

```bash
git checkout main
git pull origin main

git checkout feature/database-verification
git merge main
```

Test your changes before requesting a review.

### Pull Request Description

Use the following format:

```markdown
## What changed?

Describe what you implemented.

## Why?

Explain why this change was needed.

## Testing

Explain how you tested the changes.

## Screenshots

Add screenshots if applicable.
```

---

## 👀 5. Peer Review

Every Pull Request should be reviewed by **at least one other team member** before merging.

The reviewer should check:

* [ ] The code works as expected
* [ ] The changes match the assigned task
* [ ] No unnecessary changes were added
* [ ] No passwords or API keys were committed
* [ ] Code is readable and consistent
* [ ] Tests pass when applicable

If changes are requested, update the same branch:

```bash
git add .
git commit -m "Address review feedback"
git push
```

The Pull Request will automatically update.

---

## ✅ 6. Merge

After the Pull Request has been reviewed and approved:

```text
Task Branch
     ↓
Pull Request
     ↓
Peer Review
     ↓
Approved
     ↓
  main
```

The Pull Request can then be merged into `main`.

---

## 📌 Git Rules

1. Do not push directly to `main`.
2. Create a branch for every task.
3. Keep each branch focused on one task.
4. Pull the latest `main` before starting work.
5. Use meaningful commit messages.
6. Push your task branch to GitHub.
7. Open a Pull Request when your task is ready.
8. Get peer review before merging.
9. Resolve conflicts before merging.
10. Never commit secrets or `.env` files.

---

## 📁 Project Structure

```text
techtalks-skillproof/
├── app/                 # Next.js App Router: pages and API routes
│   ├── api/             # Backend endpoints (projects, recruiter, profile, auth, ...)
│   ├── candidate/       # Candidate pages (projects, profile, interested recruiters)
│   ├── candidates/[id]/ # Public candidate profile
│   ├── recruiter/       # Recruiter dashboard
│   ├── verifier/        # Verifier review queue
│   └── components/      # Shared UI
├── lib/                 # Business logic + unit tests (*.test.ts)
├── prisma/              # Schema and migrations
├── auth.ts              # NextAuth configuration
├── middleware.ts        # Route protection by role
└── DEPLOYMENT.md        # Deploy steps and verifier approval process
```


---

## 🔐 Security

**Private does not mean secret-safe.**

Never commit:

* Passwords
* API keys
* Authentication tokens
* Database credentials
* Real user data
* `.env` files

Example `.gitignore` entries:

```text
.env
.env.local
node_modules/
```

Use `.env.example` with placeholders only:

```text
DATABASE_URL=
NEXTAUTH_SECRET=
```

---

## 🎯 Main User Journey

```text
Candidate creates project profile
              ↓
Named verifier evaluates project
              ↓
Candidate opts in to visibility
              ↓
Recruiter browses verified profiles
              ↓
Recruiter filters candidates
              ↓
Recruiter expresses interest
              ↓
Candidate's contact info is shared with that recruiter
```

---

## 📊 Project Status

**Status:** ✅ MVP complete and live — 4 sprints delivered

### Completed

* [x] Product discovery, problem validation and MVP definition
* [x] Database schema and migrations
* [x] Authentication with email verification and password reset
* [x] Candidate project profiles with evidence
* [x] Verifier review flow with named verifiers and team-approved verifier accounts
* [x] Recruiter discovery, search, interest and shortlist
* [x] Email notifications (interest, verification result)
* [x] Verifier rubric scoring (4 criteria) shown on public profiles
* [x] Project deletion, recruiter "My shortlist" page, privacy and terms pages
* [x] Dark mode and mobile layout fixes
* [x] Automated tests and CI
* [x] Deployment on Vercel

### Future work (V2)

* [ ] Profile picture and CV upload
* [ ] Work experience on profiles
* [ ] Sign-in attempt limits (TS-67)
* [ ] Separate development and production databases
* [ ] Route-level tests for every authorization rule


---

## 🤝 Team Collaboration

Our standard workflow is:

```text
One Task
    ↓
One Task Branch
    ↓
Meaningful Commits
    ↓
Push Branch
    ↓
Pull Request
    ↓
Peer Review
    ↓
Approval
    ↓
Merge into main
