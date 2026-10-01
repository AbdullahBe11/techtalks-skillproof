// Shapes the interests the signed-in candidate has received into the list
// shown on /candidate/interests. Kept separate from the route so it can be
// unit tested without a database.

export type ReceivedInterestRow = {
  createdAt: Date
  user: {
    name: string
    email: string
  }
}

export type InterestedRecruiter = {
  recruiterName: string
  recruiterEmail: string
  createdAt: string
}

export function toInterestedRecruiters(
  rows: ReceivedInterestRow[]
): InterestedRecruiter[] {
  return [...rows]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((row) => ({
      recruiterName: row.user.name,
      recruiterEmail: row.user.email,
      createdAt: row.createdAt.toISOString(),
    }))
}
