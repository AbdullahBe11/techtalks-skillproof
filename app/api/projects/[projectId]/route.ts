import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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

// A candidate can only toggle between these two states through this route.
// "archived" exists on ProjectState but isn't part of this action.
const TOGGLE_STATES = ["draft", "published"] as const
type ToggleState = (typeof TOGGLE_STATES)[number]

function isToggleState(value: unknown): value is ToggleState {
  return (
    typeof value === "string" &&
    (TOGGLE_STATES as readonly string[]).includes(value)
  )
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

    const { title, description, status } = body

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

    // status, if provided, toggles publishedState between draft and published
    if (status !== undefined && !isToggleState(status)) {
      return NextResponse.json(
        { error: "status must be 'draft' or 'published'." },
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

    const hasContentChange =
  (title !== undefined && title.trim() !== project.title) ||
  (description !== undefined &&
    (description.trim() || null) !== project.description)

    // Only update the fields that were actually provided. status only
    // changes here, when the candidate explicitly sends it — nothing about
    // evidence edits touches publishedState.
    const data: {
      title?: string
      description?: string | null
      verificationStatus?: "pending"
      publishedState?: ToggleState
    } = {}

    if (title !== undefined) {
      data.title = title.trim()
    }

    if (description !== undefined) {
      data.description = description.trim() || null
    }

    if (status !== undefined) {
      data.publishedState = status
    }
    if (project.verificationStatus === "rejected" && hasContentChange) {
  data.verificationStatus = "pending"
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
