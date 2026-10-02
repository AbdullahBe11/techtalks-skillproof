import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { projectMatchesQuery } from "@/lib/skills"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get("keyword")?.trim()

    // Only authenticated users can access this endpoint.
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Candidate profiles are only available to recruiters.
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "recruiter") {
      return NextResponse.json(
        { error: "Only recruiters can access candidate profiles." },
        { status: 403 }
      )
    }

    const candidates = await prisma.user.findMany({
      where: {
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
        profile: {
          include: {
            // Only verified and published projects are exposed to recruiters.
            projects: {
              where: {
                verificationStatus: "verified",
                publishedState: "published",
              },
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                title: true,
                description: true,
                skills: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })

    // Keyword search runs here rather than in the database so skills can be
    // matched partially and loosely ("nex" or "nextjs" finds "next.js"),
    // which Prisma can't do inside a Postgres text array.
    const matching = keyword
      ? candidates.filter((candidate) =>
          candidate.profile!.projects.some((project) =>
            projectMatchesQuery(project, keyword)
          )
        )
      : candidates

    const result = matching.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      bio: candidate.profile!.bio,
      cvUrl: candidate.profile!.cvUrl,
      projects: candidate.profile!.projects,
    }))

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Get recruiter candidate profiles error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
