import {
  generateResetToken,
  hashResetToken,
  RESET_REQUEST_COOLDOWN_MS,
} from "./password-reset"

export const EMAIL_VERIFICATION_TOKEN_TTL_MS =
  24 * 60 * 60 * 1000

// Reuse the exact same one-minute cooldown as TS-51.
export const EMAIL_VERIFICATION_REQUEST_COOLDOWN_MS =
  RESET_REQUEST_COOLDOWN_MS

export function generateEmailVerificationToken(): {
  token: string
  tokenHash: string
} {
  return generateResetToken()
}

export function hashEmailVerificationToken(token: string): string {
  return hashResetToken(token)
}

export function buildEmailVerificationEmail({
  name,
  verificationUrl,
}: {
  name: string
  verificationUrl: string
}) {
  const escapedName = escapeHtml(name)
  const escapedUrl = escapeHtml(verificationUrl)

  return {
    subject: "Confirm your SkillProof email",

    text: `Hi ${name},

Thanks for creating your SkillProof account.

Please confirm your email by opening this link:

${verificationUrl}

This link expires in 24 hours.

If you didn't create this account, you can ignore this email.

— SkillProof`,

    html: `<p>Hi ${escapedName},</p>
<p>Thanks for creating your SkillProof account.</p>
<p>Please confirm your email by clicking the link below.</p>
<p><a href="${escapedUrl}">Confirm my email</a></p>
<p>This link expires in 24 hours.</p>
<p>If you didn't create this account, you can ignore this email.</p>
<p>— SkillProof</p>`,
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}