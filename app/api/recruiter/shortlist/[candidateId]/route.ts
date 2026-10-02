import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ candidateId: string }> }

// Resolves the signed-in recruiter's id, or the error response to return.
async function requireRecruiter() {
  const session = await auth()

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    }
  }

  const userId = (session.user as { id?: string }).id

  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    }
  }

  const userRole = (session.user as { role?: string }).role

  if (userRole !== "recruiter") {
    return {
      error: NextResponse.json(
        { error: "Only recruiters can manage a shortlist." },
        { status: 403 }
      ),
    }
  }

  return { userId }
}

// Add a candidate to the recruiter's shortlist
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const recruiter = await requireRecruiter()

    if (recruiter.error) return recruiter.error

    const { candidateId } = await params

    // The candidate must be visible to recruiters: a candidate with a profile
    // and at least one verified, published project (same rule as discovery).
    const candidate = await prisma.user.findFirst({
      where: {
        id: candidateId,
        role: "candidate",
        profile: {
          projects: {
            some: {
              verificationStatus: "verified",
              publishedState: "published",
            },
          },
        },
      },
      include: {
        profile: true,
      },
    })

    if (!candidate || !candidate.profile) {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      )
    }

    // The (userId, profileId) primary key allows one entry per recruiter and
    // candidate, so a duplicate throws P2002.
    const entry = await prisma.shortList.create({
      data: {
        userId: recruiter.userId,
        profileId: candidate.profile.id,
      },
    })

    return NextResponse.json(
      {
        candidateId: candidate.id,
        shortlisted: true,
        createdAt: entry.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This candidate is already on your shortlist." },
        { status: 409 }
      )
    }

    console.error("Add to shortlist error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

// Remove a candidate from the recruiter's shortlist
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const recruiter = await requireRecruiter()

    if (recruiter.error) return recruiter.error

    const { candidateId } = await params

    // No visibility check here: a recruiter must still be able to remove a
    // candidate who was unpublished after being shortlisted.
    const profile = await prisma.profile.findUnique({
      where: {
        userId: candidateId,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      )
    }

    const removed = await prisma.shortList.deleteMany({
      where: {
        userId: recruiter.userId,
        profileId: profile.id,
      },
    })

    if (removed.count === 0) {
      return NextResponse.json(
        { error: "This candidate is not on your shortlist." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { candidateId, shortlisted: false },
      { status: 200 }
    )
  } catch (error) {
    console.error("Remove from shortlist error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}