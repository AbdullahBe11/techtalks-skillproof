// Builds the email a candidate receives when a recruiter expresses interest
// in them (TS-55). Kept free of I/O so it can be unit tested.

export type InterestEmailInput = {
  candidateName: string
  recruiterName: string
  recruiterEmail: string
  interestsUrl: string
}

export type InterestEmail = {
  subject: string
  text: string
  html: string
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function buildInterestEmail(input: InterestEmailInput): InterestEmail {
  const { candidateName, recruiterName, recruiterEmail, interestsUrl } = input

  const subject = `${recruiterName} is interested in your work on SkillProof`

  const text = [
    `Hi ${candidateName},`,
    "",
    `Good news: ${recruiterName} (${recruiterEmail}) expressed interest in your verified projects on SkillProof.`,
    "",
    "You can reply to them directly by email, or see everyone who is interested in you here:",
    interestsUrl,
    "",
    "— SkillProof",
  ].join("\n")

  const html =
    `<p>Hi ${escapeHtml(candidateName)},</p>` +
    `<p>Good news: <strong>${escapeHtml(recruiterName)}</strong> ` +
    `(<a href="mailto:${escapeHtml(recruiterEmail)}">${escapeHtml(recruiterEmail)}</a>) ` +
    `expressed interest in your verified projects on SkillProof.</p>` +
    `<p>You can reply to them directly by email, or ` +
    `<a href="${escapeHtml(interestsUrl)}">see everyone who is interested in you</a>.</p>` +
    `<p>— SkillProof</p>`

  return { subject, text, html }
}
