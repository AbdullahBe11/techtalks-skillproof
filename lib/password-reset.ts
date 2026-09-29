import crypto from "crypto"

// How long an emailed reset link stays valid.
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

// Don't send more than one reset email per account within this window.
export const RESET_REQUEST_COOLDOWN_MS = 60 * 1000 // 1 minute

// Only the SHA-256 hash is stored in the database, so a leaked database
// can't be used to reset anyone's password.
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function generateResetToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString("hex")
  return { token, tokenHash: hashResetToken(token) }
}

// Where the emailed link should point. In production this must come from
// APP_URL so the link can't be steered by a forged Host header.
export function getAppUrl(requestUrl: string): string | null {
  const configured = process.env.APP_URL?.trim().replace(/\/+$/, "")
  if (configured) return configured
  if (process.env.NODE_ENV !== "production") return new URL(requestUrl).origin
  return null
}
