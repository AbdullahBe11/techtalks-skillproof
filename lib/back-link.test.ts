import { describe, expect, it } from "vitest"

import { backLinkForRole } from "./back-link"

describe("backLinkForRole", () => {
  it("sends each signed-in role back to its own dashboard", () => {
    expect(backLinkForRole("recruiter").href).toBe("/recruiter/browse")
    expect(backLinkForRole("candidate").href).toBe("/candidate/projects")
    expect(backLinkForRole("verifier").href).toBe("/verifier/queue")
  })

  it("sends signed-out visitors and unknown roles to the public page", () => {
    expect(backLinkForRole(null).href).toBe("/projects")
    expect(backLinkForRole(undefined).href).toBe("/projects")
    expect(backLinkForRole("admin").href).toBe("/projects")
  })
})
