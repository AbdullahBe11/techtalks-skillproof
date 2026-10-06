import { NextResponse, after } from "next/server"
import { auth } from "@/auth"
import { VerificationStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { verificationBlockReason } from "@/lib/verification"
import { isEmailConfigured, sendEmail } from "@/lib/email"
import { buildVerificationResultEmail } from "@/lib/verification-result-email"
import { getAppUrl } from "@/lib/password-reset"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    const verifierId = session.user.id

    if (!verifierId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      )
    }

    // Only verifiers can update verification status
    const userRole = (session.user as { role?: string }).role

    if (userRole !== "verifier") {
      return NextResponse.json(
        { error: "Only verifiers can update project verification." },
        { status: 403 }
      )
    }

    // Get project ID
    const { projectId } = await params

    // Get request body
    let body

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      )
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 }
      )
    }

    const { verificationStatus, reviewerFeedback } = body

    // Validate verification status
    if (
      verificationStatus !== "verified" &&
      verificationStatus !== "rejected"
    ) {
      return NextResponse.json(
        {
          error:
            "verificationStatus must be 'verified' or 'rejected'.",
        },
        { status: 400 }
      )
    }

    // Validate reviewer feedback
    if (reviewerFeedback === undefined || reviewerFeedback === "") {
      return NextResponse.json(
        { error: "Please enter feedback." },
        { status: 400 }
      )
    }

    if (typeof reviewerFeedback !== "string") {
      return NextResponse.json(
        { error: "reviewerFeedback must be a string." },
        { status: 400 }
      )
    }

    // Check that the project exists.
    // Use `select` so we get:
    //   - the owner (profile.userId) for the self-verification guard,
    //   - the evidence count for the evidence guard (TS-63),
    //   - the candidate's name and email for the TS-64 email,
    //   - the current verification status so we only email on change,
    //   - the title for the email.
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        title: true,
        verificationStatus: true,
        profile: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            evidence: true,
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      )
    }

    // TS-63 guard: a verifier must never decide on their own work,
    // and a project must have evidence before it can be verified.
    const blockReason = verificationBlockReason({
      verifierId,
      ownerUserId: project.profile.userId,
      evidenceCount: project._count.evidence,
    })

    if (blockReason) {
      return NextResponse.json({ error: blockReason }, { status: 403 })
    }

    // Update verification status and feedback
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        verificationStatus:
          verificationStatus as VerificationStatus,
        reviewerFeedback,
        verifiedById: verifierId,
        verifiedAt: new Date(),
      },
    })

    // TS-64:
    // Only email the candidate when the verification status
    // actually changes. This prevents duplicate emails if the
    // verifier saves the same decision again.
    if (project.verificationStatus !== verificationStatus) {
      notifyCandidate(request.url, {
        candidateEmail: project.profile.user.email,
        candidateName: project.profile.user.name,
        projectTitle: project.title,
        outcome: verificationStatus,
        feedback: reviewerFeedback,
        verifierName: session.user.name ?? null,
      })
    }

    return NextResponse.json(updatedProject, { status: 200 })
  } catch (error) {
    console.error("Update project verification error:", error)

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}

// Send the email after the response so a slow or failing
// email server does not delay or undo the verifier's decision.
function notifyCandidate(
  requestUrl: string,
  details: {
    candidateEmail: string
    candidateName: string
    projectTitle: string
    outcome: "verified" | "rejected"
    feedback: string
    verifierName: string | null
  }
) {
  const appUrl = getAppUrl(requestUrl)

  // If email isn't configured, don't fail the verification.
  if (!appUrl || !isEmailConfigured()) {
    console.log(
      `[dev] Verification result email for ${details.candidateEmail} skipped: email is not configured.`
    )
    return
  }

  const email = buildVerificationResultEmail({
    candidateName: details.candidateName,
    projectTitle: details.projectTitle,
    outcome: details.outcome,
    feedback: details.feedback,
    verifierName: details.verifierName,
    projectsUrl: `${appUrl}/candidate/projects`,
  })

  after(async () => {
    try {
      await sendEmail({
        to: details.candidateEmail,
        ...email,
      })
    } catch (error) {
      console.error("Verification result email failed:", error)
    }
  })
}