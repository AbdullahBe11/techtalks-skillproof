import { isSafeExternalUrl } from "./validation"

// Candidate profile fields (TS-58). Every field is optional; an empty string
// or null clears it.
export const HEADLINE_MAX_LENGTH = 80
export const BIO_MAX_LENGTH = 600

export const PROFILE_LINK_FIELDS = [
  "cvUrl",
  "githubUrl",
  "linkedinUrl",
  "portfolioUrl",
] as const

export type ProfileLinkField = (typeof PROFILE_LINK_FIELDS)[number]

export type ProfileUpdate = Partial<
  Record<"headline" | "bio" | ProfileLinkField, string | null>
>

const LINK_LABELS: Record<ProfileLinkField, string> = {
  cvUrl: "CV link",
  githubUrl: "GitHub link",
  linkedinUrl: "LinkedIn link",
  portfolioUrl: "Portfolio link",
}

function cleanText(value: unknown, label: string, max: number) {
  if (value === undefined) return { ok: true as const, value: undefined }
  if (value !== null && typeof value !== "string") {
    return { ok: false as const, error: `${label} must be text.` }
  }
  const text = value === null ? "" : value.trim()
  if (text.length > max) {
    return {
      ok: false as const,
      error: `${label} must be ${max} characters or fewer.`,
    }
  }
  return { ok: true as const, value: text || null }
}

function cleanLink(value: unknown, label: string) {
  if (value === undefined) return { ok: true as const, value: undefined }
  if (value !== null && typeof value !== "string") {
    return { ok: false as const, error: `${label} must be text.` }
  }
  const link = value === null ? "" : value.trim()
  if (!link) return { ok: true as const, value: null }

  let valid = true
  try {
    new URL(link)
  } catch {
    valid = false
  }

  // Only http(s): blocks javascript: and other schemes that would run code
  // when rendered as a link.
  if (!valid || !isSafeExternalUrl(link) || link.length > 500) {
    return {
      ok: false as const,
      error: `${label} must be a valid http or https URL.`,
    }
  }
  return { ok: true as const, value: link }
}

// Validates a PATCH body. Only fields that are present are returned, so a
// partial update never wipes the other fields.
export function parseProfileUpdate(
  body: unknown
): { ok: true; data: ProfileUpdate } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, error: "Request body must be a JSON object." }
  }

  const input = body as Record<string, unknown>
  const data: ProfileUpdate = {}

  const headline = cleanText(input.headline, "Headline", HEADLINE_MAX_LENGTH)
  if (!headline.ok) return headline
  if (headline.value !== undefined) data.headline = headline.value

  const bio = cleanText(input.bio, "Bio", BIO_MAX_LENGTH)
  if (!bio.ok) return bio
  if (bio.value !== undefined) data.bio = bio.value

  for (const field of PROFILE_LINK_FIELDS) {
    const link = cleanLink(input[field], LINK_LABELS[field])
    if (!link.ok) return link
    if (link.value !== undefined) data[field] = link.value
  }

  return { ok: true, data }
}
