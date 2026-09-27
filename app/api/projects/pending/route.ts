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

    // Only verifiers can view the review queue
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "verifier") {
      return NextResponse.json(
        { error: "Only verifiers can view the review queue." },
        { status: 403 }
      )
    }

    // Get all pending projects, oldest submissions first
    const projects = await prisma.project.findMany({
      where: {
        verificationStatus: "pending",
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
