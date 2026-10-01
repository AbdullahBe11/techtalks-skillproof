import { describe, it, expect } from "vitest"

import { buildInterestEmail, escapeHtml } from "./interest-email"

const input = {
  candidateName: "Abdullah Berro",
  recruiterName: "Jordan Lee",
  recruiterEmail: "jordan@example.com",
  interestsUrl: "https://techtalks-skillproof.vercel.app/candidate/interests",
}

describe("buildInterestEmail", () => {
  it("names the recruiter in the subject", () => {
    expect(buildInterestEmail(input).subject).toBe(
      "Jordan Lee is interested in your work on SkillProof"
    )
  })

  it("includes the recruiter's contact and the interests link in both bodies", () => {
    const email = buildInterestEmail(input)

    for (const body of [email.text, email.html]) {
      expect(body).toContain("Abdullah Berro")
      expect(body).toContain("Jordan Lee")
      expect(body).toContain("jordan@example.com")
      expect(body).toContain(input.interestsUrl)
    }
  })

  it("escapes HTML in names so they can't inject markup", () => {
    const email = buildInterestEmail({
      ...input,
      recruiterName: '<script>alert("x")</script>',
    })

    expect(email.html).not.toContain("<script>")
    expect(email.html).toContain("&lt;script&gt;")
  })
})

describe("escapeHtml", () => {
  it("escapes the five HTML special characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;")
  })
})
