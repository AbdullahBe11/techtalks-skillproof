export type ProjectStatus = "draft" | "published" | "archived"

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
}

export const STATUS_CLASS: Record<ProjectStatus, string> = {
  draft: "bg-warn/10 text-warn border-warn/30",
  published: "bg-info/10 text-info border-info/30",
  archived: "bg-ink/5 text-ink/55 border-line",
}

export type VerificationStatus = "pending" | "verified" | "rejected"

export const VERIFICATION_STATUS_LABEL: Record<
  VerificationStatus,
  string
> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
}

export const VERIFICATION_STATUS_CLASS: Record<
  VerificationStatus,
  string
> = {
  pending:
    "bg-warn/10 text-warn border-warn/30",
  verified:
    "bg-brand/10 text-brand border-brand/30",
  rejected:
    "bg-danger/10 text-danger border-danger/30",
}