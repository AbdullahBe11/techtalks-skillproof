import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      projectId: string
      evidenceId: string
    }>
  }
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

    // Only candidates can delete evidence
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can delete evidence." },
        { status: 403 }
      )
    }

    // Get project and evidence IDs
    const { projectId, evidenceId } = await params

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

    // Find the evidence
    const evidence = await prisma.evidence.findFirst({
      where: {
        id: evidenceId,
        projectId,
      },
    })

    if (!evidence) {
      return NextResponse.json(
        { error: "Evidence not found." },
        { status: 404 }
      )
    }

    // Delete the evidence
    await prisma.evidence.delete({
      where: {
        id: evidenceId,
      },
    })

    // Reset verification when evidence changes
    if (
      project.verificationStatus === "verified" ||
      project.verificationStatus === "rejected"
    ) {
      await prisma.project.update({
        where: {
          id: projectId,
        },
        data: {
          verificationStatus: "pending",
          verifiedById: null,
          verifiedAt: null,
        },
      })
    }

    return NextResponse.json(
      { message: "Evidence deleted successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete evidence error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}