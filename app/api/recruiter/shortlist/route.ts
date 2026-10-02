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

    const userId = (session.user as { id?: string }).id

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Only recruiters have a shortlist
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can view their shortlist." },
        { status: 403 }
      )
    }

    // The candidates this recruiter has already shortlisted
    const entries = await prisma.shortList.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    })

    // candidateIds are candidate user ids, the same ids used by
    // /api/recruiter/candidates and /api/recruiter/shortlist/[candidateId]
    const candidateIds = entries.map((entry) => entry.profile.userId)

    return NextResponse.json({ candidateIds }, { status: 200 })
  } catch (error) {
    console.error("List shortlist error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}