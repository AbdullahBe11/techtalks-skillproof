import { describe, expect, it } from "vitest"
import { validatePassword } from "./password"
import { generateResetToken, hashResetToken } from "./password-reset"

describe("validatePassword", () => {
  it("rejects short passwords", () => {
    expect(validatePassword("abc123")).toMatch(/at least 8/)
  })
  it("rejects digits-only and letters-only passwords", () => {
    expect(validatePassword("12345678")).toMatch(/letters and numbers/)
    expect(validatePassword("abcdefgh")).toMatch(/letters and numbers/)
  })
  it("rejects non-strings", () => {
    expect(validatePassword(undefined)).not.toBeNull()
  })
  it("accepts letters + numbers, 8+ chars", () => {
    expect(validatePassword("skillproof1")).toBeNull()
  })
})

describe("reset tokens", () => {
  it("stores only a hash that matches the emailed token", () => {
    const { token, tokenHash } = generateResetToken()
    expect(token).toHaveLength(64)
    expect(tokenHash).not.toBe(token)
    expect(hashResetToken(token)).toBe(tokenHash)
  })
  it("generates a different token every time", () => {
    expect(generateResetToken().token).not.toBe(generateResetToken().token)
  })
})
