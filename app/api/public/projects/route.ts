import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Read the optional search parameter from the URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    // Get verified projects and optionally filter by title or description
    const projects = await prisma.project.findMany({
      where: {
        verificationStatus: "verified",
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
    })

    // Return only the fields needed by the public API
    const result = projects.map((project) => ({
      id: project.id,
      title: project.title,
      candidateName: project.profile.user.name,
      description: project.description,
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