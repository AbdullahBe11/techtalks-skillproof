import { describe, expect, it } from "vitest"

import {
  currentScoreSummary,
  parseRubricScores,
  summarizeScores,
} from "./rubric"

const valid = {
  functionality: 4,
  code_quality: 3,
  documentation: 5,
  ownership: 4,
}

describe("parseRubricScores", () => {
  it("accepts a score for every criterion, in rubric order", () => {
    const result = parseRubricScores(valid)
    expect(result).toEqual({
      ok: true,
      scores: [
        { criterionId: "functionality", score: 4 },
        { criterionId: "code_quality", score: 3 },
        { criterionId: "documentation", score: 5 },
        { criterionId: "ownership", score: 4 },
      ],
    })
  })

  it("rejects a missing criterion", () => {
    const partial = { functionality: 4, code_quality: 3, documentation: 5 }
    const result = parseRubricScores(partial)
    expect(result).toEqual({ ok: false, error: "Please score Ownership." })
  })

  it("rejects scores out of range or not whole numbers", () => {
    expect(parseRubricScores({ ...valid, functionality: 0 }).ok).toBe(false)
    expect(parseRubricScores({ ...valid, functionality: 6 }).ok).toBe(false)
    expect(parseRubricScores({ ...valid, functionality: 3.5 }).ok).toBe(false)
    expect(parseRubricScores({ ...valid, functionality: "4" }).ok).toBe(false)
  })

  it("rejects unknown criteria and non-objects", () => {
    expect(parseRubricScores({ ...valid, design: 5 }).ok).toBe(false)
    expect(parseRubricScores(undefined).ok).toBe(false)
    expect(parseRubricScores([4, 3, 5, 4]).ok).toBe(false)
  })
})

describe("summarizeScores", () => {
  it("returns scores in rubric order with a rounded average", () => {
    const summary = summarizeScores([
      { criterionId: "ownership", score: 4 },
      { criterionId: "functionality", score: 4 },
      { criterionId: "documentation", score: 5 },
      { criterionId: "code_quality", score: 3 },
    ])
    expect(summary?.criteria.map((c) => c.id)).toEqual([
      "functionality",
      "code_quality",
      "documentation",
      "ownership",
    ])
    expect(summary?.average).toBe(4)
  })

  it("returns null when a criterion is missing", () => {
    expect(
      summarizeScores([{ criterionId: "functionality", score: 4 }])
    ).toBeNull()
  })
})

describe("currentScoreSummary", () => {
  const full = [
    { criterionId: "functionality", score: 5 },
    { criterionId: "code_quality", score: 4 },
    { criterionId: "documentation", score: 4 },
    { criterionId: "ownership", score: 5 },
  ]

  it("uses the review by the verifier who made the current decision", () => {
    const summary = currentScoreSummary(
      [
        { userId: "old-verifier", scores: [] },
        { userId: "current-verifier", scores: full },
      ],
      "current-verifier"
    )
    expect(summary?.average).toBe(4.5)
  })

  it("shows nothing when the project has no current verifier", () => {
    expect(
      currentScoreSummary([{ userId: "v", scores: full }], null)
    ).toBeNull()
  })
})
