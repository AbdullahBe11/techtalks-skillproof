import { describe, expect, it } from "vitest"

import { verificationBlockReason } from "./verification"

describe("verificationBlockReason", () => {
  it("allows a different verifier when the project has evidence", () => {
    expect(
      verificationBlockReason({
        verifierId: "verifier-1",
        ownerUserId: "candidate-1",
        evidenceCount: 2,
      })
    ).toBeNull()
  })

  it("blocks a verifier from verifying their own project", () => {
    expect(
      verificationBlockReason({
        verifierId: "user-1",
        ownerUserId: "user-1",
        evidenceCount: 1,
      })
    ).toBe("You can't verify your own project.")
  })

  it("blocks projects with no evidence", () => {
    expect(
      verificationBlockReason({
        verifierId: "verifier-1",
        ownerUserId: "candidate-1",
        evidenceCount: 0,
      })
    ).toBe("This project has no evidence to review yet.")
  })
})
