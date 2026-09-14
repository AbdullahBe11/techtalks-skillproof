# SkillProof — Database Schema

**Status:** Approved for Sprint 01 (schema sign-off required from Jamela, Jaafar, Abdallah Khodor before code lands)
**Engine:** PostgreSQL
**ORM:** Prisma

This document is the written source of truth for the schema shown in the ERD. Sprint 01's migration
implements only `users` and `profiles`; the remaining tables land in later sprints per the roadmap below.

---

## Enums

| Enum | Values |
|---|---|
| `role` | `CANDIDATE`, `RECRUITER`, `VERIFIER`, `ADMIN` |
| `publish_state` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `evidence_type` | `GITHUB`, `DEMO`, `DOCUMENTATION`, `OTHER` |

---

## Tables

### `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `name` | text | |
| `email` | text | UNIQUE |
| `role` | `role` enum | |
| `password` | text | hashed, never stored plain |
| `phone_number` | text | |
| `created_at` | timestamp | default now() |

### `profiles`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `user_id` | FK → `users.id` | UNIQUE (one profile per user) |
| `bio` | text | |
| `cv_url` | text | |
| `created_at` | timestamp | default now() |

### `projects`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `profile_id` | FK → `profiles.id` | |
| `title` | text | |
| `description` | text | |
| `created_at` | timestamp | default now() |
| `published_state` | `publish_state` enum | default `DRAFT` |

### `evidence`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `project_id` | FK → `projects.id` | |
| `type` | `evidence_type` enum | |
| `evidence_url` | text | |
| `created_at` | timestamp | default now() |

### `reviews`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `project_id` | FK → `projects.id` | |
| `user_id` | FK → `users.id` | the verifier |
| `created_at` | timestamp | default now() |
| `is_visible` | boolean | |
| — | — | UNIQUE (`project_id`, `user_id`) — one review per verifier per project |

### `review_scores`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `review_id` | FK → `reviews.id` | |
| `criterion_id` | FK → `rubric_criteria.id` | |
| `score` | numeric | |
| `justification` | text | |
| — | — | UNIQUE (`review_id`, `criterion_id`) |

### `rubric_criteria`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `name` | text | |
| `description` | text | |
| `max_score` | numeric | |

### `interests`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `user_id` | FK → `users.id` | |
| `profile_id` | FK → `profiles.id` | |
| `created_at` | timestamp | default now() |
| — | — | UNIQUE (`user_id`, `profile_id`) |

### `short_lists`
| Column | Type | Constraints |
|---|---|---|
| `id` | uuid / serial | PK |
| `user_id` | FK → `users.id` | |
| `profile_id` | FK → `profiles.id` | |
| `created_at` | timestamp | default now() |
| — | — | UNIQUE (`user_id`, `profile_id`) |

---

## Relationships

- `users` 1—1 `profiles` (one profile per user)
- `profiles` 1—N `projects`
- `projects` 1—N `evidence`
- `projects` 1—N `reviews`
- `reviews` 1—N `review_scores`
- `rubric_criteria` 1—N `review_scores`
- `users` N—N `profiles` via `interests` (junction table)
- `users` N—N `profiles` via `short_lists` (junction table)

---

## Sprint roadmap

| Sprint | Tables added |
|---|---|
| 01 | `users`, `profiles` |
| 02–06 | `projects`, `evidence`, `rubric_criteria`, `reviews`, `review_scores`, `interests`, `short_lists` |

---

## Sign-off

- [X] Jamela Hallal
- [ ] Jaafar Ali Khsheish
- [X] Abdallah Ahmad Khodor

Sprint 01 code does not begin until all three boxes are checked.
