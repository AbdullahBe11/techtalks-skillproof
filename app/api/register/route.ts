import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { isEmailConfigured, sendEmail } from "@/lib/email"
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  buildEmailVerificationEmail,
  generateEmailVerificationToken,
} from "@/lib/email-verification"
import { getAppUrl } from "@/lib/password-reset"

// Only these roles can be picked during public sign-up.
// "admin" and "verifier" are deliberately excluded: verifiers are approved by
// the team and promoted manually in the database (see DEPLOYMENT.md).
const ALLOWED_ROLES = ["candidate", "recruiter"] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()

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
    const { name, email, password, phoneNumber, role } = body

    // 1. Make sure the required fields actually arrived
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are all required." },
        { status: 400 }
      )
    }

    // 2. Verifier accounts are never created through public sign-up
    if (role === "verifier") {
      return NextResponse.json(
        {
          error:
            "Verifier accounts can't be created through sign-up. Email us to request access.",
        },
        { status: 403 }
      )
    }

    // Reject anything that isn't one of the allowed roles
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      )
    }

    // 3. Basic password strength check — at least 8 characters, and not just
    // digits (e.g. "12345678" must be rejected). Requiring both a letter and
    // a number is a lightweight way to rule that out without being overly
    // strict about symbols/casing for this MVP.
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      )
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain both letters and numbers." },
        { status: 400 }
      )
    }

    // 4. Check the email isn't already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }

    // 5. Hash the password — never store it as plain text
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. Create the user and its email-verification token together.
    const { newUser, token } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phoneNumber: phoneNumber || null,
          role,
        },
      })

      const { token, tokenHash } = generateEmailVerificationToken()

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(
            Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS
          ),
        },
      })

      return {
        newUser: user,
        token,
      }
    })

    const verificationUrl =
      `${appUrl}/verify-email?token=${token}`

    if (!emailReady) {
      // Local development without SMTP: print the link in the terminal.
      console.log(
        `[dev] Email verification link for ${newUser.email}: ${verificationUrl}`
      )
    } else {
      try {
        const email = buildEmailVerificationEmail({
          name: newUser.name,
          verificationUrl,
        })

        await sendEmail({
          to: newUser.email,
          ...email,
        })
      } catch (error) {
        console.error("Verification email failed:", error)
      }
    }

    // 7. Never send the password hash back to the client.
    // The user must verify the email before signing in.
    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        message: "Check your inbox to confirm your email.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
