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
