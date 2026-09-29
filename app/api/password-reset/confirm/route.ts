import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validatePassword } from "@/lib/password"
import { hashResetToken } from "@/lib/password-reset"

const INVALID_LINK = "This reset link is invalid or has expired. Please request a new one."

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const token = typeof body?.token === "string" ? body.token.trim() : ""
    const password = body?.password

    if (!token) {
      return NextResponse.json({ error: INVALID_LINK }, { status: 400 })
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    })

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: INVALID_LINK }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password as string, 10)

    // Mark the link as used only if nobody else used it first, then change
    // the password and clear any other outstanding links for this account.
    const updated = await prisma.$transaction(async (tx) => {
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      })
      if (claimed.count === 0) return false

      await tx.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      })
      await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      })
      return true
    })

    if (!updated) {
      return NextResponse.json({ error: INVALID_LINK }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Your password has been reset. You can now sign in." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Password reset confirm error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
