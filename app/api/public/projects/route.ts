import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizeSkill } from "@/lib/skills"

export async function GET(request: Request) {
  try {
    // Read the optional search parameter from the URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || null
    // Optional exact skill filter, e.g. ?skill=react
    const skill = normalizeSkill(searchParams.get("skill") ?? "") || null

    // Get verified projects and optionally filter by title or description
    const projects = await prisma.project.findMany({
      where: {
        verificationStatus: "verified",
        publishedState: "published",
        ...(skill ? { skills: { has: skill } } : {}),
        ...(search
          ? {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                // A search that exactly matches a skill tag (e.g. "React")
                {
                  skills: {
                    has: normalizeSkill(search),
                  },
                },
              ],
            }
          : {}),
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

    // Return only the fields needed by the public API
    const result = projects.map((project) => ({
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