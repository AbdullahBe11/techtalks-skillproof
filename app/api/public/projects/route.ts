import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { projectMatchesQuery, sameSkillLoose } from "@/lib/skills"

export async function GET(request: Request) {
  try {
    // Read the optional search parameter from the URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || null
    // Optional skill filter, e.g. ?skill=react (tolerant of "nextjs" vs "next.js")
    const skill = searchParams.get("skill")?.trim() || null

    // Get all verified, published projects
    const projects = await prisma.project.findMany({
      where: {
        verificationStatus: "verified",
        publishedState: "published",
      },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Skill and text search run here rather than in the database so skills
    // can be matched partially and loosely ("nex" or "nextjs" finds "next.js").
    const matching = projects.filter(
      (project) =>
        (!skill || project.skills.some((s) => sameSkillLoose(s, skill))) &&
        (!search || projectMatchesQuery(project, search))
    )

    // Return only the fields needed by the public API
    const result = matching.map((project) => ({
      id: project.id,
      title: project.title,
      candidateId: project.profile.user.id,
      candidateName: project.profile.user.name,
      description: project.description,
      skills: project.skills,
    }))

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Public projects error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}