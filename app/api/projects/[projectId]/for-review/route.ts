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

    // Only verifiers can view projects for review
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "verifier") {
      return NextResponse.json(
        { error: "Only verifiers can view projects for review." },
        { status: 403 }
      )
    }

    // Get project ID
    const { projectId } = await params

    // Find the project — no ownership check, any verifier can review any project
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        evidence: true,
        profile: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      )
    }

    // Flatten the candidate's name out of the nested join
    const { profile, ...rest } = project

    return NextResponse.json(
      {
        ...rest,
        candidateName: profile.user.name,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get project for review error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
