import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Only candidates can add evidence
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can add evidence." },
        { status: 403 }
      )
    }

    // Get project ID
    const { projectId } = await params

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

    const { type, shortLabel, evidenceUrl } = body

    // Validate required fields
    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "type is required." },
        { status: 400 }
      )
    }

    if (!shortLabel || typeof shortLabel !== "string") {
      return NextResponse.json(
        { error: "shortLabel is required." },
        { status: 400 }
      )
    }

    if (!evidenceUrl || typeof evidenceUrl !== "string") {
      return NextResponse.json(
        { error: "evidenceUrl is required." },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(evidenceUrl)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL." },
        { status: 400 }
      )
    }

    // Find the signed-in user and profile
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        profile: true,
      },
    })

    if (!user || !user.profile) {
      return NextResponse.json(
        { error: "Profile not found." },
        { status: 404 }
      )
    }

    // Find the project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      )
    }

    // Make sure the candidate owns the project
    if (project.profileId !== user.profile.id) {
      return NextResponse.json(
        { error: "You do not own this project." },
        { status: 403 }
      )
    }

    // Create the evidence
    const evidence = await prisma.evidence.create({
      data: {
        projectId,
        type: type as "github" | "demo" | "documentation" | "other",
        shortLabel: shortLabel.trim(),
        evidenceUrl: evidenceUrl.trim(),
      },
    })

    return NextResponse.json(evidence, { status: 201 })
  } catch (error) {
    console.error("Create evidence error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
