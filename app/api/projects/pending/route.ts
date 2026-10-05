import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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

    const verifierId = session.user.id

    if (!verifierId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Only verifiers can view the review queue
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "verifier") {
      return NextResponse.json(
        { error: "Only verifiers can view the review queue." },
        { status: 403 }
      )
    }

    // Pending projects that have evidence to review, oldest first.
    // A verifier's own projects are left out so they can't review them.
    const projects = await prisma.project.findMany({
      where: {
        verificationStatus: "pending",
        evidence: { some: {} },
        profile: { userId: { not: verifierId } },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    })

    // Flatten the candidate's name out of the nested join
    const result = projects.map((project) => ({
      id: project.id,
      title: project.title,
      createdAt: project.createdAt,
      candidateName: project.profile.user.name,
    }))

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("List pending projects error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
