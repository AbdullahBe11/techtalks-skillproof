import { describe, expect, it } from "vitest"

import {
  EMAIL_VERIFICATION_REQUEST_COOLDOWN_MS,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  buildEmailVerificationEmail,
  generateEmailVerificationToken,
  hashEmailVerificationToken,
} from "./email-verification"
import { RESET_REQUEST_COOLDOWN_MS } from "./password-reset"

describe("email verification tokens", () => {
  it("generates a raw token and matching hash", () => {
    const { token, tokenHash } = generateEmailVerificationToken()

    expect(token).toHaveLength(64)
    expect(tokenHash).not.toBe(token)
    expect(hashEmailVerificationToken(token)).toBe(tokenHash)
  })

  it("uses a 24-hour token lifetime", () => {
    expect(EMAIL_VERIFICATION_TOKEN_TTL_MS).toBe(
      24 * 60 * 60 * 1000
    )
  })

  it("uses the same one-minute cooldown as password reset", () => {
    expect(EMAIL_VERIFICATION_REQUEST_COOLDOWN_MS).toBe(
      RESET_REQUEST_COOLDOWN_MS
    )
  })

  it("escapes HTML in the email", () => {
    const email = buildEmailVerificationEmail({
      name: '<script>alert("x")</script>',
      verificationUrl:
        "http://localhost:3000/verify-email?token=abc",
    })

    expect(email.html).not.toContain("<script>")
    expect(email.html).toContain("&lt;script&gt;")
  })
})