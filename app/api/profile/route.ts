import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { parseProfileUpdate } from "@/lib/profile"

type ProfileRow = {
  id: string
  userId: string
  headline: string | null
  bio: string | null
  cvUrl: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
}

function toResponse(profile: ProfileRow) {
  return {
    id: profile.id,
    userId: profile.userId,
    headline: profile.headline,
    bio: profile.bio,
    cvUrl: profile.cvUrl,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
  }
}

// Resolves the signed-in candidate's user id, or the error response to return.
async function requireCandidate(action: string) {
  const session = await auth()

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    }
  }

  const userId = (session.user as { id?: string }).id

  if (!userId) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    }
  }

  const userRole = (session.user as { role?: string }).role

  if (userRole !== "candidate") {
    return {
      error: NextResponse.json(
        { error: `Only candidates can ${action} their profile.` },
        { status: 403 }
      ),
    }
  }

  return { userId }
}

export async function GET() {
  try {
    const candidate = await requireCandidate("view")
    if (candidate.error) return candidate.error

    // Auto-create an empty profile the first time a candidate opens it
    const profile = await prisma.profile.upsert({
      where: { userId: candidate.userId },
      update: {},
      create: { userId: candidate.userId },
    })

    return NextResponse.json(toResponse(profile), { status: 200 })
  } catch (error) {
    console.error("Get profile error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const candidate = await requireCandidate("edit")
    if (candidate.error) return candidate.error

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      )
    }

    // Validates headline, bio and links; only the fields that were sent are
    // updated, so a partial PATCH never clears the others.
    const parsed = parseProfileUpdate(body)

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const profile = await prisma.profile.upsert({
      where: { userId: candidate.userId },
      update: parsed.data,
      create: { userId: candidate.userId, ...parsed.data },
    })

    return NextResponse.json(toResponse(profile), { status: 200 })
  } catch (error) {
    console.error("Update profile error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
