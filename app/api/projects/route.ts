import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { parseSkills } from "@/lib/skills"

export async function GET() {
  try {
    // 1. Check if the user is signed in
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // 2. Only candidates can view their own projects
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can view their own projects." },
        { status: 403 }
      )
    }

    // 3. Get the signed-in user's database record
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      )
    }

    // 4. A candidate without a profile yet simply has no projects
    if (!user.profile) {
      return NextResponse.json([], { status: 200 })
    }

    // 5. Get the candidate's projects, most recent first
    const projects = await prisma.project.findMany({
      where: {
        profileId: user.profile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            evidence: true,
          },
        },
      },
    })

    // 6. Shape the response
    const result = projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      publishedState: project.publishedState,
      verificationStatus: project.verificationStatus,
      createdAt: project.createdAt,
      skills: project.skills,
      evidenceCount: project._count.evidence,
    }))

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("List projects error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // 1. Check if the user is signed in
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // 2. Only candidates can create projects
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "candidate") {
      return NextResponse.json(
        { error: "Only candidates can create projects." },
        { status: 403 }
      )
    }

    // 3. Read the request body
    const body = await request.json()
    const { title, description, skills } = body

    // 4. Title is required
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required." },
        { status: 400 }
      )
    }

    // Skills are optional; when sent they must be a valid list of tags
    const parsedSkills = parseSkills(skills ?? [])
    if (!parsedSkills.ok) {
      return NextResponse.json({ error: parsedSkills.error }, { status: 400 })
    }

    // 5. Get the signed-in user's database record
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      )
    }

    // 6. Create a profile if the candidate does not have one
    let profile = user.profile

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
        },
      })
    }

    // 7. Create the project
    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        title: title.trim(),
        description:
          typeof description === "string"
            ? description.trim() || null
            : null,
        skills: parsedSkills.skills,
      },
    })

    // 8. Return the created project
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}