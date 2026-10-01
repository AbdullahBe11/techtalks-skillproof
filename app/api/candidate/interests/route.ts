import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { toInterestedRecruiters } from "@/lib/interests"

// GET /api/candidate/interests
// Lists the recruiters who expressed interest in the signed-in candidate
// (TS-47). Per the TS-41 decision there is no accept/decline step: the
// candidate sees each recruiter's name and email and can reach out directly.
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can view recruiters interested in them." },
        { status: 403 }
      )
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    })

    // A candidate without a profile can't have received any interest yet
    if (!profile) {
      return NextResponse.json({ recruiters: [] }, { status: 200 })
    }

    const interests = await prisma.interest.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      { recruiters: toInterestedRecruiters(interests) },
      { status: 200 }
    )
  } catch (error) {
    console.error("List candidate interests error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
