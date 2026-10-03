import { describe, expect, it } from "vitest"
import {
  MAX_SKILLS,
  candidateMatchesQuery,
  compactSkill,
  normalizeSkill,
  parseSkills,
  projectMatchesQuery,
  sameSkillLoose,
  sameSkills,
  skillMatchesQuery,
} from "./skills"

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

describe("skill search matching", () => {
  it("compacts spelling differences but keeps # and +", () => {
    expect(compactSkill("Next.js")).toBe("nextjs")
    expect(compactSkill("next js")).toBe("nextjs")
    expect(compactSkill("next-js")).toBe("nextjs")
    expect(compactSkill("C#")).toBe("c#")
    expect(compactSkill("C++")).toBe("c++")
  })

  it("matches partial and loosely spelled queries", () => {
    expect(skillMatchesQuery("next.js", "nex")).toBe(true)
    expect(skillMatchesQuery("next.js", "nextjs")).toBe(true)
    expect(skillMatchesQuery("typescript", "type script")).toBe(true)
    expect(skillMatchesQuery("typescript", "Type")).toBe(true)
    expect(skillMatchesQuery("python", "java")).toBe(false)
    expect(skillMatchesQuery("python", "  ")).toBe(false)
  })

  it("compares a clicked skill loosely but not partially", () => {
    expect(sameSkillLoose("next.js", "NextJS")).toBe(true)
    expect(sameSkillLoose("next.js", "next")).toBe(false)
    expect(sameSkillLoose("c#", "c++")).toBe(false)
  })

  it("matches a project by title, description or skill", () => {
    const project = {
      title: "SkillProof Platform",
      description: "Verified projects for recruiters",
      skills: ["next.js", "typescript"],
    }
    expect(projectMatchesQuery(project, "skillproof")).toBe(true)
    expect(projectMatchesQuery(project, "recruiters")).toBe(true)
    expect(projectMatchesQuery(project, "nextjs")).toBe(true)
    expect(projectMatchesQuery(project, "type script")).toBe(true)
    expect(projectMatchesQuery(project, "django")).toBe(false)
  })
})

describe("candidateMatchesQuery", () => {
  const candidate = {
    name: "Abdullah Berro",
    headline: "Full-Stack Developer | Team Lead",
    bio: "I build reliable web apps.",
    projects: [
      { title: "SkillProof", description: null, skills: ["next.js"] },
    ],
  }

  it("matches name, headline and bio", () => {
    expect(candidateMatchesQuery(candidate, "berro")).toBe(true)
    expect(candidateMatchesQuery(candidate, "full-stack")).toBe(true)
    expect(candidateMatchesQuery(candidate, "team lead")).toBe(true)
    expect(candidateMatchesQuery(candidate, "reliable")).toBe(true)
  })

  it("still matches projects and skills", () => {
    expect(candidateMatchesQuery(candidate, "skillproof")).toBe(true)
    expect(candidateMatchesQuery(candidate, "nextjs")).toBe(true)
  })

  it("does not match unrelated text or missing fields", () => {
    expect(candidateMatchesQuery(candidate, "django")).toBe(false)
    expect(
      candidateMatchesQuery(
        { name: "X", headline: null, bio: null, projects: [] },
        "developer"
      )
    ).toBe(false)
  })
})
