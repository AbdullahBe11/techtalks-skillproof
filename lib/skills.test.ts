import { describe, expect, it } from "vitest"
import { MAX_SKILLS, normalizeSkill, parseSkills, sameSkills } from "./skills"

describe("normalizeSkill", () => {
  it("trims, collapses spaces and lowercases", () => {
    expect(normalizeSkill("  Next   JS ")).toBe("next js")
    expect(normalizeSkill("React")).toBe("react")
  })
})

describe("parseSkills", () => {
  it("cleans and de-duplicates tags case-insensitively", () => {
    expect(parseSkills(["React", " react ", "Node.js", ""])).toEqual({
      ok: true,
      skills: ["react", "node.js"],
    })
  })
  it("rejects anything that isn't a list of strings", () => {
    expect(parseSkills("react")).toMatchObject({ ok: false })
    expect(parseSkills([1, 2])).toMatchObject({ ok: false })
    expect(parseSkills(null)).toMatchObject({ ok: false })
  })
  it("rejects too many skills", () => {
    const many = Array.from({ length: MAX_SKILLS + 1 }, (_, i) => `skill${i}`)
    expect(parseSkills(many)).toMatchObject({ ok: false })
  })
  it("rejects overly long skills", () => {
    expect(parseSkills(["x".repeat(31)])).toMatchObject({ ok: false })
  })
  it("accepts an empty list", () => {
    expect(parseSkills([])).toEqual({ ok: true, skills: [] })
  })
})

describe("sameSkills", () => {
  it("ignores order", () => {
    expect(sameSkills(["a", "b"], ["b", "a"])).toBe(true)
    expect(sameSkills(["a"], ["a", "b"])).toBe(false)
  })
})
