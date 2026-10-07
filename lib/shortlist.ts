// Shapes the recruiter's shortlist for GET /api/recruiter/shortlist.
// Kept free of I/O so it can be unit tested.
 
export type ShortlistEntry = {
  profile: {
    userId: string
    headline: string | null
    user: { name: string }
    // Count of verified AND published projects only (what recruiters can see).
    _count: { projects: number }
  }
}
 
export type ShortlistedCandidate = {
  id: string
  name: string
  headline: string | null
  verifiedProjectCount: number
  profileUrl: string
}
 
export type ShortlistResponse = {
  // Kept so existing callers (e.g. the candidate profile page's shortlist
  // button) keep working.
  candidateIds: string[]
  candidates: ShortlistedCandidate[]
}
 
export function buildShortlistResponse(
  entries: ShortlistEntry[]
): ShortlistResponse {
  const candidates = entries.map(({ profile }) => ({
    // Candidate *user* id, the same id used by /api/recruiter/candidates
    // and /api/recruiter/shortlist/[candidateId].
    id: profile.userId,
    name: profile.user.name,
    headline: profile.headline,
    verifiedProjectCount: profile._count.projects,
    profileUrl: `/candidates/${profile.userId}`,
  }))
 
  return {
    candidateIds: candidates.map((candidate) => candidate.id),
    candidates,
  }
}