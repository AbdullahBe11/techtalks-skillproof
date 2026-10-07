import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildShortlistResponse } from "@/lib/shortlist"
 
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
 
    // The candidates this recruiter has shortlisted. Filtering on the
    // signed-in recruiter's own id is what keeps every shortlist private.
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
            headline: true,
            user: {
              select: {
                name: true,
              },
            },
            // Same rule recruiters see in Browse: verified and published only.
            _count: {
              select: {
                projects: {
                  where: {
                    verificationStatus: "verified",
                    publishedState: "published",
                  },
                },
              },
            },
          },
        },
      },
    })
 
    return NextResponse.json(buildShortlistResponse(entries), { status: 200 })
  } catch (error) {
    console.error("List shortlist error:", error)
 
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
