import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            projects: {
              where: {
                verificationStatus: "verified",
                publishedState: "published",
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                title: true,
                description: true,
                skills: true,
                createdAt: true,
                verifiedAt: true,
                verifiedBy: {
                  select: {
                    name: true,
                  },
                },
                evidence: {
                  select: {
                    id: true,
                    type: true,
                    evidenceUrl: true,
                    shortLabel: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Not found, not a candidate, or a candidate who never created a
    // profile — all treated as 404, nothing here is auth-gated info.
    if (!user || user.role !== "candidate" || !user.profile) {
      return NextResponse.json(
        { error: "Candidate not found." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        headline: user.profile.headline,
        bio: user.profile.bio,
        cvUrl: user.profile.cvUrl,
        githubUrl: user.profile.githubUrl,
        linkedinUrl: user.profile.linkedinUrl,
        portfolioUrl: user.profile.portfolioUrl,
        projects: user.profile.projects,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Get public candidate profile error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
