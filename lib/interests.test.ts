import { describe, it, expect } from "vitest"

import { toInterestedRecruiters } from "./interests"

describe("toInterestedRecruiters", () => {
  it("returns an empty list when no recruiter has shown interest", () => {
    expect(toInterestedRecruiters([])).toEqual([])
  })

  it("maps recruiter name, email and date, newest first", () => {
    const result = toInterestedRecruiters([
      {
        createdAt: new Date("2026-09-30T10:00:00.000Z"),
        user: { name: "Older Recruiter", email: "older@example.com" },
      },
      {
        createdAt: new Date("2026-10-01T10:00:00.000Z"),
        user: { name: "Newer Recruiter", email: "newer@example.com" },
      },
    ])

    expect(result).toEqual([
      {
        recruiterName: "Newer Recruiter",
        recruiterEmail: "newer@example.com",
        createdAt: "2026-10-01T10:00:00.000Z",
      },
      {
        recruiterName: "Older Recruiter",
        recruiterEmail: "older@example.com",
        createdAt: "2026-09-30T10:00:00.000Z",
      },
    ])
  })
})
