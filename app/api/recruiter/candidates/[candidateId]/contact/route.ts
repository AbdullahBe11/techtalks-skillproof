import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    // Only authenticated recruiters can access candidate contact details.
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const userId = (session.user as { id?: string }).id
    const userRole = (session.user as { role?: string }).role

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    if (userRole !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can view candidate contact details." },
        { status: 403 }
      )
    }

    const { candidateId } = await params

    // Candidate email is returned only when this recruiter
    // has already expressed interest in the candidate.
    const interest = await prisma.interest.findFirst({
      where: {
        userId,
        profile: {
          userId: candidateId,
        },
      },
      select: {
        profile: {
          select: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })

    // No interest means the recruiter is not allowed to see the email.
    if (!interest) {
      return NextResponse.json(
        { error: "Candidate contact details are not available." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { email: interest.profile.user.email },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get candidate contact error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}