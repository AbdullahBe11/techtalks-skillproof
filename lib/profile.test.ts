import { describe, expect, it } from "vitest"

import {
  BIO_MAX_LENGTH,
  HEADLINE_MAX_LENGTH,
  parseProfileUpdate,
} from "./profile"

describe("parseProfileUpdate", () => {
  it("trims values and only returns fields that were sent", () => {
    expect(
      parseProfileUpdate({
        headline: "  Junior Full-Stack Developer ",
        githubUrl: "https://github.com/someone",
      })
    ).toEqual({
      ok: true,
      data: {
        headline: "Junior Full-Stack Developer",
        githubUrl: "https://github.com/someone",
      },
    })
  })

  it("clears fields sent as empty or null", () => {
    expect(parseProfileUpdate({ bio: "   ", linkedinUrl: null })).toEqual({
      ok: true,
      data: { bio: null, linkedinUrl: null },
    })
  })

  it("rejects text that is too long", () => {
    expect(
      parseProfileUpdate({ headline: "x".repeat(HEADLINE_MAX_LENGTH + 1) }).ok
    ).toBe(false)
    expect(parseProfileUpdate({ bio: "x".repeat(BIO_MAX_LENGTH + 1) }).ok).toBe(
      false
    )
  })

  it("rejects unsafe or malformed links", () => {
    expect(parseProfileUpdate({ portfolioUrl: "javascript:alert(1)" }).ok).toBe(
      false
    )
    expect(parseProfileUpdate({ cvUrl: "not a url" }).ok).toBe(false)
    expect(parseProfileUpdate({ githubUrl: 42 }).ok).toBe(false)
  })

  it("rejects a non-object body", () => {
    expect(parseProfileUpdate(null).ok).toBe(false)
    expect(parseProfileUpdate([]).ok).toBe(false)
  })
})
