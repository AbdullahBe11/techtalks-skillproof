// Rules a verifier must pass before deciding on a project.
// Kept separate from the route so it can be unit-tested.

export type VerificationCheckInput = {
  verifierId: string
  ownerUserId: string
  evidenceCount: number
}

export function verificationBlockReason({
  verifierId,
  ownerUserId,
  evidenceCount,
}: VerificationCheckInput): string | null {
  // A verifier must never decide on their own work.
  if (verifierId === ownerUserId) {
    return "You can't verify your own project."
  }

  // Nothing to check without evidence.
  if (evidenceCount < 1) {
    return "This project has no evidence to review yet."
  }

  return null
}
