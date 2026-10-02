import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashEmailVerificationToken } from "@/lib/email-verification"

const INVALID_LINK =
  "This verification link is invalid or has expired. Please request a new one."

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const token =
      typeof body?.token === "string" ? body.token.trim() : ""

    if (!token) {
      return NextResponse.json(
        { error: INVALID_LINK },
        { status: 400 }
      )
    }

    const record =
      await prisma.emailVerificationToken.findUnique({
        where: {
          tokenHash:
            hashEmailVerificationToken(token),
        },
      })

    if (
      !record ||
      record.usedAt ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: INVALID_LINK },
        { status: 400 }
      )
    }

    const verified = await prisma.$transaction(
      async (tx) => {
        // Claim the token so two simultaneous requests
        // cannot both use it.
        const claimed =
          await tx.emailVerificationToken.updateMany({
            where: {
              id: record.id,
              usedAt: null,
            },
            data: {
              usedAt: new Date(),
            },
          })

        if (claimed.count === 0) {
          return false
        }

        await tx.user.update({
          where: {
            id: record.userId,
          },
          data: {
            emailVerifiedAt: new Date(),
          },
        })

        // Verification succeeded, so remove outstanding tokens.
        await tx.emailVerificationToken.deleteMany({
          where: {
            userId: record.userId,
          },
        })

        return true
      }
    )

    if (!verified) {
      return NextResponse.json(
        { error: INVALID_LINK },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message:
          "Email confirmed — you can sign in now",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Email verification confirm error:",
      error
    )

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}