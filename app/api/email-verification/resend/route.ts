import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isEmailConfigured, sendEmail } from "@/lib/email"
import {
  EMAIL_VERIFICATION_REQUEST_COOLDOWN_MS,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  buildEmailVerificationEmail,
  generateEmailVerificationToken,
} from "@/lib/email-verification"
import { getAppUrl } from "@/lib/password-reset"

const GENERIC_RESPONSE = {
  message:
    "If that email belongs to an unverified account, a confirmation link has been sent.",
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const email =
      typeof body?.email === "string" ? body.email.trim() : ""

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      )
    }

    const appUrl = getAppUrl(request.url)
    const emailReady = isEmailConfigured()

    if (
      !appUrl ||
      (process.env.NODE_ENV === "production" && !emailReady)
    ) {
      console.error(
        "Email verification is not configured: set APP_URL and SMTP_* environment variables."
      )

      return NextResponse.json(
        {
          error:
            "Email verification isn't available right now. Please contact the SkillProof team.",
        },
        { status: 503 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Same response whether the account doesn't exist or is already verified.
    if (!user || user.emailVerifiedAt) {
      return NextResponse.json(GENERIC_RESPONSE, {
        status: 200,
      })
    }

    // Same one-minute cooldown used by TS-51.
    const recent = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gt: new Date(
            Date.now() - EMAIL_VERIFICATION_REQUEST_COOLDOWN_MS
          ),
        },
      },
    })

    if (recent) {
      return NextResponse.json(GENERIC_RESPONSE, {
        status: 200,
      })
    }

    // Only the newest unused link should remain valid.
    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    })

    const { token, tokenHash } =
      generateEmailVerificationToken()

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS
        ),
      },
    })

    const verificationUrl =
      `${appUrl}/verify-email?token=${token}`

    if (!emailReady) {
      console.log(
        `[dev] Email verification link for ${user.email}: ${verificationUrl}`
      )

      return NextResponse.json(GENERIC_RESPONSE, {
        status: 200,
      })
    }

    try {
      const emailContent = buildEmailVerificationEmail({
        name: user.name,
        verificationUrl,
      })

      await sendEmail({
        to: user.email,
        ...emailContent,
      })
    } catch (error) {
      console.error(
        "Verification resend email failed:",
        error
      )
    }

    return NextResponse.json(GENERIC_RESPONSE, {
      status: 200,
    })
  } catch (error) {
    console.error(
      "Email verification resend error:",
      error
    )

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}