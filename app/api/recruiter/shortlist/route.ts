import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    const userRole = (session.user as { role?: string }).role

    if (userRole !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can shortlist candidates." },
        { status: 403 }
      )
    }

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

    const recruiter = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
    })

    if (!recruiter) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      )
    }

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

    const shortList = await prisma.shortList.create({
      data: {
        userId: recruiter.id,
        profileId: candidate.profile.id,
      },
    })

    return NextResponse.json(
      {
        candidateId: candidate.id,
        profileId: shortList.profileId,
        createdAt: shortList.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You have already shortlisted this candidate." },
        { status: 409 }
      )
    }

    console.error("Shortlist candidate error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}