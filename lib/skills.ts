// Skill tags on a project (TS-40). Tags are stored lowercase so search is
// case-insensitive: "React", "react" and " REACT " are all the same skill.
export const MAX_SKILLS = 10
export const MAX_SKILL_LENGTH = 30

export function normalizeSkill(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

// Validates and cleans a skills list from a request body.
// Returns the cleaned list, or an error message.
export function parseSkills(
  input: unknown
): { ok: true; skills: string[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.some((s) => typeof s !== "string")) {
    return { ok: false, error: "Skills must be a list of text tags." }
  }

  const skills: string[] = []
  for (const raw of input as string[]) {
    const skill = normalizeSkill(raw)
    if (!skill) continue
    if (skill.length > MAX_SKILL_LENGTH) {
      return { ok: false, error: `Each skill must be ${MAX_SKILL_LENGTH} characters or fewer.` }
    }
    if (!skills.includes(skill)) skills.push(skill)
  }

  if (skills.length > MAX_SKILLS) {
    return { ok: false, error: `A project can have at most ${MAX_SKILLS} skills.` }
  }

  return { ok: true, skills }
}

export function sameSkills(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((s) => b.includes(s))
}

// Search helpers. Skills are compared in a "compact" form so small spelling
// differences still match: "Next.js", "nextjs", "next js" and "next-js" are
// all "nextjs". "#" and "+" are kept so "c#" and "c++" stay distinct.
export function compactSkill(value: string): string {
  return value.toLowerCase().replace(/[\s._-]+/g, "")
}

// Partial match: "nex" finds "next.js", "type script" finds "typescript".
export function skillMatchesQuery(skill: string, query: string): boolean {
  const q = compactSkill(query)
  return q.length > 0 && compactSkill(skill).includes(q)
}

// Exact skill filter (e.g. a clicked chip), tolerant of the same differences.
export function sameSkillLoose(a: string, b: string): boolean {
  const ca = compactSkill(a)
  return ca.length > 0 && ca === compactSkill(b)
}

// True when a project's title, description or any of its skills match the query.
export function projectMatchesQuery(
  project: { title: string; description: string | null; skills: string[] },
  query: string
): boolean {
  const text = query.trim().toLowerCase()
  if (!text) return true
  return (
    project.title.toLowerCase().includes(text) ||
    (project.description ?? "").toLowerCase().includes(text) ||
    project.skills.some((skill) => skillMatchesQuery(skill, query))
  )
}
