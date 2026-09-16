import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
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

    // Only candidates can view project details
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can view project details." },
        { status: 403 }
      )
    }

    // Get project ID
    const { projectId } = await params

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

    // Make sure the candidate owns the project
    if (project.profileId !== user.profile.id) {
      return NextResponse.json(
        { error: "You do not own this project." },
        { status: 403 }
      )
    }

    // Only load the evidence once we know the candidate is allowed to see it
    const evidence = await prisma.evidence.findMany({
      where: {
        projectId,
      },
    })

    return NextResponse.json({ ...project, evidence }, { status: 200 })
  } catch (error) {
    console.error("Get project error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    // Only candidates can edit projects
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can edit projects." },
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

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 }
      )
    }

    const { title, description } = body

    // Title, if provided, must not be empty
    if (
      title !== undefined &&
      (typeof title !== "string" || !title.trim())
    ) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      )
    }

    // Description, if provided, must be a string
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { error: "Description must be a string." },
        { status: 400 }
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

    // Make sure the candidate owns the project
    if (project.profileId !== user.profile.id) {
      return NextResponse.json(
        { error: "You do not own this project." },
        { status: 403 }
      )
    }

    // Only update the fields that were actually provided
    const data: { title?: string; description?: string | null } = {}

    if (title !== undefined) {
      data.title = title.trim()
    }

    if (description !== undefined) {
      data.description = description.trim() || null
    }

    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data,
    })

    return NextResponse.json(updatedProject, { status: 200 })
  } catch (error) {
    console.error("Update project error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
