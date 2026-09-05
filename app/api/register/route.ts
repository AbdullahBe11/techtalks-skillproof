import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// Only these roles can be picked during public sign-up.
// "admin" is deliberately excluded — that account type should never
// be created through a form anyone can reach.
const ALLOWED_ROLES = ["candidate", "recruiter", "verifier"] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phoneNumber, role } = body

    // 1. Make sure the required fields actually arrived
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are all required." },
        { status: 400 }
      )
    }

    // 2. Reject anything that isn't one of the allowed roles
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role." },
        { status: 400 }
      )
    }

    // 3. Basic password strength check
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
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

    // 6. Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        role,
      },
    })

    // 7. Never send the password hash back to the client
    return NextResponse.json(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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
