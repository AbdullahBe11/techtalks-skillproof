import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Only candidates have a profile
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates have a profile." },
        { status: 403 }
      )
    }

    // Find the signed-in user
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

    // Auto-create an empty profile the first time a candidate hits this
    const profile =
      user.profile ??
      (await prisma.profile.create({
        data: {
          userId: user.id,
        },
      }))

    return NextResponse.json(
      {
        id: profile.id,
        bio: profile.bio,
        cvUrl: profile.cvUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get profile error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Only candidates can edit their profile
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can edit their profile." },
        { status: 403 }
      )
    }

    // Get request body
    let body

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      )
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 }
      )
    }

    const { bio, cvUrl } = body

    // bio, if provided, must be a string (or null, to clear it)
    if (bio !== undefined && bio !== null && typeof bio !== "string") {
      return NextResponse.json(
        { error: "bio must be a string." },
        { status: 400 }
      )
    }

    // cvUrl, if provided, must be a well-formed URL (or null/empty, to clear it)
    if (cvUrl !== undefined && cvUrl !== null) {
      if (typeof cvUrl !== "string") {
        return NextResponse.json(
          { error: "cvUrl must be a string." },
          { status: 400 }
        )
      }

      if (cvUrl.trim()) {
        try {
          new URL(cvUrl)
        } catch {
          return NextResponse.json(
            { error: "Invalid URL." },
            { status: 400 }
          )
        }
      }
    }

    // Find the signed-in user
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

    // Only update the fields that were actually provided
    const data: { bio?: string | null; cvUrl?: string | null } = {}

    if (bio !== undefined) {
      data.bio = bio === null ? null : bio.trim() || null
    }

    if (cvUrl !== undefined) {
      data.cvUrl = cvUrl === null ? null : cvUrl.trim() || null
    }

    // Create the profile if it doesn't exist yet (PATCH can arrive before
    // GET ever has), otherwise update the existing one
    const profile = user.profile
      ? await prisma.profile.update({
          where: {
            id: user.profile.id,
          },
          data,
        })
      : await prisma.profile.create({
          data: {
            userId: user.id,
            ...data,
          },
        })

    return NextResponse.json(
      {
        id: profile.id,
        bio: profile.bio,
        cvUrl: profile.cvUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update profile error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
