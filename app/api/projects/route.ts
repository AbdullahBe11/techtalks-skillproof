import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // 1. Check if the user is signed in
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // 2. Only candidates can create projects
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can create projects." },
        { status: 403 }
      )
    }

    // 3. Read the request body
    const body = await request.json()
    const { title, description } = body

    // 4. Title is required
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      )
    }

    // 5. Get the signed-in user's database record
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      )
    }

    // 6. Create a profile if the candidate does not have one
    let profile = user.profile

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
        },
      })
    }

    // 7. Create the project
    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        title: title.trim(),
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
      },
    })

    // 8. Return the created project
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}