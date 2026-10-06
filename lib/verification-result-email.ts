// Builds the email a candidate receives when a verifier finishes reviewing
// one of their projects (TS-64). Kept free of I/O so it can be unit tested.

import { escapeHtml } from "./interest-email"

export type VerificationOutcome = "verified" | "rejected"

export type VerificationResultEmailInput = {
  candidateName: string
  projectTitle: string
  outcome: VerificationOutcome
  // Written justification / rejection reason from the verifier, if any.
  feedback?: string | null
  // Named verifier, if you want to show who reviewed it.
  verifierName?: string | null
  projectsUrl: string
}

export type VerificationResultEmail = {
  subject: string
  text: string
  html: string
}

// Titles are user-supplied; keep them on one line so they are safe in a header.
function singleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function buildVerificationResultEmail(
  input: VerificationResultEmailInput
): VerificationResultEmail {
  const { candidateName, outcome, projectsUrl } = input
  const projectTitle = singleLine(input.projectTitle)
  const feedback = input.feedback?.trim() || null
  const verifierName = input.verifierName?.trim() || null

  const verified = outcome === "verified"

  const subject = verified
    ? `Your project "${projectTitle}" was verified on SkillProof`
    : `Your project "${projectTitle}" was not verified`

  const byLine = verifierName ? ` by ${verifierName}` : ""

  const headline = verified
    ? `Good news: your project "${projectTitle}" has been reviewed${byLine} and verified.`
    : `Your project "${projectTitle}" has been reviewed${byLine}, and it was not verified this time.`

  const feedbackLabel = verified ? "Reviewer's comments:" : "Reason given:"

  const text = [
    `Hi ${candidateName},`,
    "",
    headline,
    ...(feedback ? ["", feedbackLabel, feedback] : []),
    "",
    "You can see the details on your projects page:",
    projectsUrl,
    "",
    "— SkillProof",
  ].join("\n")

  const html =
    `<p>Hi ${escapeHtml(candidateName)},</p>` +
    `<p>${
      verified
        ? `Good news: your project <strong>${escapeHtml(projectTitle)}</strong> has been reviewed${escapeHtml(byLine)} and verified.`
        : `Your project <strong>${escapeHtml(projectTitle)}</strong> has been reviewed${escapeHtml(byLine)}, and it was not verified this time.`
    }</p>` +
    (feedback
      ? `<p><strong>${feedbackLabel}</strong><br>${escapeHtml(feedback).replace(/\r?\n/g, "<br>")}</p>`
      : "") +
    `<p>You can see the details on <a href="${escapeHtml(projectsUrl)}">your projects page</a>.</p>` +
    `<p>— SkillProof</p>`

  return { subject, text, html }
}
