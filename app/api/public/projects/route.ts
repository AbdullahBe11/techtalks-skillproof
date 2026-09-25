import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export async function GET(request: Request) {
  try {
    // Read the optional search/pagination parameters from the URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const cursor = searchParams.get("cursor")

    const requestedLimit = Number(searchParams.get("limit"))
    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0 &&
      requestedLimit <= MAX_LIMIT
        ? requestedLimit
        : DEFAULT_LIMIT

    // Get verified projects and optionally filter by title or description
    const projects = await prisma.project.findMany({
      where: {
        verificationStatus: "verified",
        publishedState: "published",
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
      take: limit,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    })

    // Return only the fields needed by the public API
    const result = projects.map((project) => ({
      id: project.id,
      title: project.title,
      candidateId: project.profile.user.id,
      candidateName: project.profile.user.name,
      description: project.description,
    }))

    const nextCursor =
      result.length < limit ? null : result[result.length - 1].id

    return NextResponse.json(
      { projects: result, nextCursor },
      { status: 200 }
    )
  } catch (error) {
    console.error("Public projects error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}