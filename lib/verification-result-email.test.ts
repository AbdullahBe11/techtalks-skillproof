import { describe, it, expect } from "vitest"

import { buildVerificationResultEmail } from "./verification-result-email"

const base = {
  candidateName: "Abdullah Berro",
  projectTitle: "Inventory Tracker",
  feedback: "Clear README and clean commit history.",
  verifierName: "Sara Khoury",
  projectsUrl: "https://techtalks-skillproof.vercel.app/candidate/projects",
}

describe("buildVerificationResultEmail", () => {
  it("uses a verified subject and wording", () => {
    const email = buildVerificationResultEmail({ ...base, outcome: "verified" })

    expect(email.subject).toBe(
      'Your project "Inventory Tracker" was verified on SkillProof'
    )
    expect(email.text).toContain("verified")
    expect(email.text).not.toContain("not verified")
  })

  it("uses a rejected subject and wording", () => {
    const email = buildVerificationResultEmail({ ...base, outcome: "rejected" })

    expect(email.subject).toBe('Your project "Inventory Tracker" was not verified')
    expect(email.text).toContain("not verified")
  })

  it("includes the feedback, verifier and link in both bodies", () => {
    const email = buildVerificationResultEmail({ ...base, outcome: "rejected" })

    for (const body of [email.text, email.html]) {
      expect(body).toContain("Abdullah Berro")
      expect(body).toContain("Clear README and clean commit history.")
      expect(body).toContain("Sara Khoury")
      expect(body).toContain(base.projectsUrl)
    }
  })

  it("leaves out the feedback section when there is none", () => {
    const email = buildVerificationResultEmail({
      ...base,
      outcome: "verified",
      feedback: "   ",
    })

    expect(email.text).not.toContain("Reviewer's comments:")
    expect(email.html).not.toContain("Reviewer's comments:")
  })

  it("escapes HTML in the title, name and feedback", () => {
    const email = buildVerificationResultEmail({
      ...base,
      outcome: "rejected",
      candidateName: "<b>x</b>",
      projectTitle: '<script>alert("x")</script>',
      feedback: "<img src=x onerror=alert(1)>",
    })

    expect(email.html).not.toContain("<script>")
    expect(email.html).not.toContain("<img")
    expect(email.html).toContain("&lt;script&gt;")
  })

  it("keeps a multi-line title on one line in the subject", () => {
    const email = buildVerificationResultEmail({
      ...base,
      outcome: "verified",
      projectTitle: "Line one\r\nBcc: evil@example.com",
    })

    expect(email.subject).not.toMatch(/[\r\n]/)
  })
})