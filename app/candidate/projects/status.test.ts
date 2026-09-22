import { describe, it, expect } from "vitest"
import { STATUS_LABEL, STATUS_CLASS, type ProjectStatus } from "./status"

describe("project status maps", () => {
  const statuses: ProjectStatus[] = ["draft", "published", "archived"]

  it("has a label for every status", () => {
    for (const status of statuses) {
      expect(STATUS_LABEL[status]).toBeTruthy()
    }
  })

  it("has a css class for every status", () => {
    for (const status of statuses) {
      expect(STATUS_CLASS[status]).toBeTruthy()
    }
  })

  it("labels are human-readable, not raw status strings", () => {
    expect(STATUS_LABEL.draft).toBe("Draft")
    expect(STATUS_LABEL.published).toBe("Published")
    expect(STATUS_LABEL.archived).toBe("Archived")
  })
})