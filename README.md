# Skill Proof 🚀

> **Bridging the trust gap in software hiring through verified, human-evaluated project profiles.**

## 📌 Project Overview

**Skill Proof** is a web platform designed for the Lebanese tech ecosystem that replaces unverified traditional CVs with rubric-scored project profiles.

It enables university students and recent software graduates to showcase their true technical capabilities while helping recruiters shortlist verified candidates faster and with greater confidence.

---

## ✨ Approved MVP

- 👨‍💻 Developer Project Profiles
- 📊 Rubric-Based Evaluation
- 🔎 Recruiter Discovery Dashboard
- 🤝 Direct Connect Flow

### Out of Scope for V1

- AI-assisted grading
- Employer-submitted project challenges
- Payments
- Partner bootcamps
- Advanced/automated matching

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| Frontend | Next.js / React |
| Styling | Tailwind CSS |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| Authentication | Token-based Authentication |
| Deployment | Vercel |

---

## 👥 Team & Responsibilities

| Name | Role / Focus Area |
|------|------------------|
| **Abdullah Mohammad Berro** | Team Lead / Planning / Frontend / Backend |
| **Abdallah Ahmad Khodor** | Backend Engineering |
| **Ali Bakri** | Frontend Engineering |
| **Youssef Dawoud** | Frontend Engineering |
| **Jaafar Ali Khsheish** | Database Architecture |
| **Jamila Hallal** | Database Architecture |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js `>= v18.x.x`
- npm
- PostgreSQL
- Git

### Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd skill-proof
````

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Add your local configuration to the `.env` file.

> ⚠️ Never commit passwords, API keys, tokens, or database credentials.

### Run the Application

```bash
npm run dev
```

---

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
skill-proof/
│
├── frontend/
│
├── backend/
│
├── database/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

> The project structure may evolve as development progresses.

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
JWT_SECRET=
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
Candidate responds
              ↓
Direct connection
```

---

## 📊 Project Status

**Status:** 🚧 In Progress

### Completed

* [x] Product discovery
* [x] Customer/problem validation
* [x] Competitor research
* [x] MVP definition
* [x] Technical stack selection
* [x] Team responsibilities

### Planned

* [ ] Database schema
* [ ] Authentication
* [ ] Candidate project profiles
* [ ] Verifier evaluation system
* [ ] Recruiter discovery dashboard
* [ ] Candidate filtering
* [ ] Recruiter interest flow
* [ ] Testing
* [ ] Deployment

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
