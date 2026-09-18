export type ProjectStatus = "draft" | "published" | "archived"

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
}

export const STATUS_CLASS: Record<ProjectStatus, string> = {
  draft: "bg-[#B8862F]/10 text-[#B8862F] border-[#B8862F]/30",
  published: "bg-[#3D5A73]/10 text-[#3D5A73] border-[#3D5A73]/30",
  archived: "bg-[#16231F]/5 text-[#16231F]/55 border-[#D8D3C4]",
}
