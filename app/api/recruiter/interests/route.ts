import { NextResponse, after } from "next/server"
import { Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isEmailConfigured, sendEmail } from "@/lib/email"
import { buildInterestEmail } from "@/lib/interest-email"
import { getAppUrl } from "@/lib/password-reset"

export async function POST(request: Request) {
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

    // Only recruiters can express interest
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can express interest in candidates." },
        { status: 403 }
      )
    }

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

    const { candidateId } = body

    if (!candidateId || typeof candidateId !== "string") {
      return NextResponse.json(
        { error: "candidateId is required." },
        { status: 400 }
      )
    }

    // Find the signed-in recruiter
    const recruiter = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      )
    }

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

    // Create the interest. The (userId, profileId) primary key enforces one
    // interest per recruiter and candidate, so a duplicate throws P2002.
    const interest = await prisma.interest.create({
      data: {
        userId: recruiter.id,
        profileId: candidate.profile.id,
      },
    })

    // Let the candidate know (TS-55). Only reached for a new interest, since a
    // duplicate throws P2002 above. The email is sent after the response so a
    // slow or failing mail server never delays or breaks the recruiter's click.
    notifyCandidate(request.url, {
      candidateEmail: candidate.email,
      candidateName: candidate.name,
      recruiterName: recruiter.name,
      recruiterEmail: recruiter.email,
    })

    return NextResponse.json(
      {
        candidateId: candidate.id,
        profileId: interest.profileId,
        createdAt: interest.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already expressed interest in this candidate." },
        { status: 409 }
      )
    }

    console.error("Express interest error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

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

    // Only recruiters can view their interests
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can view their interests." },
        { status: 403 }
      )
    }

    // The candidates this recruiter has already marked as interested
    const interests = await prisma.interest.findMany({
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
    // /api/recruiter/candidates and POST /api/recruiter/interests
    const candidateIds = interests.map((interest) => interest.profile.userId)

    return NextResponse.json({ candidateIds }, { status: 200 })
  } catch (error) {
    console.error("List interests error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

function notifyCandidate(
  requestUrl: string,
  details: {
    candidateEmail: string
    candidateName: string
    recruiterName: string
    recruiterEmail: string
  }
) {
  const appUrl = getAppUrl(requestUrl)

  if (!appUrl || !isEmailConfigured()) {
    console.log(
      `[dev] Interest email for ${details.candidateEmail} skipped: email is not configured.`
    )
    return
  }

  const email = buildInterestEmail({
    candidateName: details.candidateName,
    recruiterName: details.recruiterName,
    recruiterEmail: details.recruiterEmail,
    interestsUrl: `${appUrl}/candidate/interests`,
  })

  after(async () => {
    try {
      await sendEmail({ to: details.candidateEmail, ...email })
    } catch (error) {
      console.error("Interest notification email failed:", error)
    }
  })
}
