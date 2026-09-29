import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isEmailConfigured, sendEmail } from "@/lib/email"
import {
  RESET_REQUEST_COOLDOWN_MS,
  RESET_TOKEN_TTL_MS,
  generateResetToken,
  getAppUrl,
} from "@/lib/password-reset"

// Always the same answer, whether or not the email has an account, so this
// endpoint can't be used to discover who is registered.
const GENERIC_RESPONSE = {
  message:
    "If an account exists for that email, we've sent a link to reset your password.",
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === "string" ? body.email.trim() : ""

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const appUrl = getAppUrl(request.url)
    const emailReady = isEmailConfigured()
    if (!appUrl || (process.env.NODE_ENV === "production" && !emailReady)) {
      console.error(
        "Password reset is not configured: set APP_URL and SMTP_* environment variables."
      )
      return NextResponse.json(
        { error: "Password reset isn't available right now. Please contact the SkillProof team." },
        { status: 503 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 })
    }

    // Light throttle: ignore repeat requests for the same account for a minute.
    const recent = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - RESET_REQUEST_COOLDOWN_MS) },
      },
    })
    if (recent) {
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 })
    }

    // Only the newest link should work — drop any older unused ones.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    const { token, tokenHash } = generateResetToken()
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    })

    const resetUrl = `${appUrl}/reset-password?token=${token}`

    if (!emailReady) {
      // Local development without SMTP: print the link instead of emailing it.
      console.log(`[dev] Password reset link for ${email}: ${resetUrl}`)
      return NextResponse.json(GENERIC_RESPONSE, { status: 200 })
    }

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your SkillProof password",
        text: `Hi ${user.name},\n\nSomeone asked to reset the password for your SkillProof account. Open this link to choose a new one (it expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't ask for this, you can ignore this email — your password won't change.\n\n— SkillProof`,
        html: `<p>Hi ${escapeHtml(user.name)},</p><p>Someone asked to reset the password for your SkillProof account. Click the link below to choose a new one. It expires in 1 hour.</p><p><a href="${resetUrl}">Reset my password</a></p><p>If you didn't ask for this, you can ignore this email — your password won't change.</p><p>— SkillProof</p>`,
      })
    } catch (error) {
      console.error("Password reset email failed:", error)
    }

    return NextResponse.json(GENERIC_RESPONSE, { status: 200 })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
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
