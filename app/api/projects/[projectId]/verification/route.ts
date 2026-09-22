import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient, VerificationStatus } from "@prisma/client"

const prisma = new PrismaClient()

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

    // Only verifiers can update verification status
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "verifier") {
      return NextResponse.json(
        { error: "Only verifiers can update project verification." },
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

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 }
      )
    }

    const { verificationStatus, reviewerFeedback } = body

    // Validate verification status
    if (
      verificationStatus !== "verified" &&
      verificationStatus !== "rejected"
    ) {
      return NextResponse.json(
        {
          error:
            "verificationStatus must be 'verified' or 'rejected'.",
        },
        { status: 400 }
      )
    }

    // Validate reviewer feedback
    if (reviewerFeedback === undefined || reviewerFeedback === "") {
      return NextResponse.json(
        { error: "Please enter feedback." },
        { status: 400 }
      )
    }

    if (typeof reviewerFeedback !== "string") {
      return NextResponse.json(
        { error: "reviewerFeedback must be a string." },
        { status: 400 }
      )
    }

    // Check that the project exists
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

    // Update verification status and feedback
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        verificationStatus:
          verificationStatus as VerificationStatus,
        reviewerFeedback,
      },
    })

    return NextResponse.json(updatedProject, { status: 200 })
  } catch (error) {
    console.error("Update project verification error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
