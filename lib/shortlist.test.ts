import { describe, it, expect } from "vitest"
 
import { buildShortlistResponse } from "./shortlist"
 
const entries = [
  {
    profile: {
      userId: "cand-2",
      headline: "Frontend developer",
      user: { name: "Lina Haddad" },
      _count: { projects: 3 },
    },
  },
  {
    profile: {
      userId: "cand-1",
      headline: null,
      user: { name: "Omar Saab" },
      _count: { projects: 0 },
    },
  },
]
 
describe("buildShortlistResponse", () => {
  it("returns name, headline, verified project count and profile link", () => {
    const { candidates } = buildShortlistResponse(entries)
 
    expect(candidates[0]).toEqual({
      id: "cand-2",
      name: "Lina Haddad",
      headline: "Frontend developer",
      verifiedProjectCount: 3,
      profileUrl: "/candidates/cand-2",
    })
  })
 
  it("keeps candidateIds in the same order for existing callers", () => {
    expect(buildShortlistResponse(entries).candidateIds).toEqual([
      "cand-2",
      "cand-1",
    ])
  })
 
  it("keeps candidates with no verified projects and a missing headline", () => {
    const { candidates } = buildShortlistResponse(entries)
 
    expect(candidates[1].verifiedProjectCount).toBe(0)
    expect(candidates[1].headline).toBeNull()
  })
 
  it("returns empty lists for an empty shortlist", () => {
    expect(buildShortlistResponse([])).toEqual({
      candidateIds: [],
      candidates: [],
    })
  })
})
