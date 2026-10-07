// Rubric scoring (TS-49).
// Verifiers score every criterion from SCORE_MIN to SCORE_MAX and still
// choose Verified or Rejected themselves. The scores add detail; they
// never decide the outcome on their own.
//
// The ids below must match the rows inserted by the
// 20261007120000_seed_rubric_criteria migration.

export const SCORE_MIN = 1
export const SCORE_MAX = 5

export type RubricCriterion = {
  id: string
  name: string
  description: string
}

export const RUBRIC_CRITERIA: readonly RubricCriterion[] = [
  {
    id: "functionality",
    name: "Functionality",
    description: "Does the project work and do what it claims?",
  },
  {
    id: "code_quality",
    name: "Code quality",
    description: "Is the code readable, organised and reasonably safe?",
  },
  {
    id: "documentation",
    name: "Documentation",
    description: "Is there a clear README or docs explaining how to run and use it?",
  },
  {
    id: "ownership",
    name: "Ownership",
    description: "Is there clear evidence the candidate really built it?",
  },
]

export type RubricScore = {
  criterionId: string
  score: number
}

export type ParseScoresResult =
  | { ok: true; scores: RubricScore[] }
  | { ok: false; error: string }

// Validates the `scores` object sent by the verifier:
// { functionality: 4, code_quality: 3, ... }
// Every criterion is required, each score must be a whole number in range,
// and unknown criteria are rejected.
export function parseRubricScores(input: unknown): ParseScoresResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, error: "Please score every criterion." }
  }

  const values = input as Record<string, unknown>
  const knownIds = new Set(RUBRIC_CRITERIA.map((c) => c.id))

  for (const key of Object.keys(values)) {
    if (!knownIds.has(key)) {
      return { ok: false, error: `Unknown criterion: ${key}.` }
    }
  }

  const scores: RubricScore[] = []

  for (const criterion of RUBRIC_CRITERIA) {
    const value = values[criterion.id]

    if (value === undefined || value === null) {
      return { ok: false, error: `Please score ${criterion.name}.` }
    }

    if (
      typeof value !== "number" ||
      !Number.isInteger(value) ||
      value < SCORE_MIN ||
      value > SCORE_MAX
    ) {
      return {
        ok: false,
        error: `${criterion.name} must be a whole number from ${SCORE_MIN} to ${SCORE_MAX}.`,
      }
    }

    scores.push({ criterionId: criterion.id, score: value })
  }

  return { ok: true, scores }
}

export type ScoreSummary = {
  criteria: { id: string; name: string; score: number }[]
  average: number
}

// Turns stored scores into a display-ready summary in rubric order.
// Returns null unless every criterion has a score, so partial or
// outdated reviews are never shown.
export function summarizeScores(
  scores: readonly RubricScore[]
): ScoreSummary | null {
  const byId = new Map(scores.map((s) => [s.criterionId, s.score]))
  const criteria: ScoreSummary["criteria"] = []

  for (const criterion of RUBRIC_CRITERIA) {
    const score = byId.get(criterion.id)
    if (score === undefined) return null
    criteria.push({ id: criterion.id, name: criterion.name, score })
  }

  const total = criteria.reduce((sum, c) => sum + c.score, 0)
  const average = Math.round((total / criteria.length) * 10) / 10

  return { criteria, average }
}

// A project can have reviews from several verifiers over time (for example
// after evidence changes and it is reviewed again). Only the review by the
// verifier who made the current decision is shown; if the project is back
// to pending (verifiedById is null), no scores are shown.
export function currentScoreSummary(
  reviews: readonly { userId: string; scores: readonly RubricScore[] }[],
  verifiedById: string | null
): ScoreSummary | null {
  if (!verifiedById) return null
  const review = reviews.find((r) => r.userId === verifiedById)
  return review ? summarizeScores(review.scores) : null
}
