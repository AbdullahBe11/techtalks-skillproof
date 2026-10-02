"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import EmptyState from "@/app/components/EmptyState"
import { CheckBadge } from "@/app/components/AppShell"
import { isSafeExternalUrl } from "@/lib/validation"
import { SkillChips } from "@/app/components/SkillTags"

type EvidenceType = "github" | "demo" | "documentation" | "other"

type CandidateEvidence = {
  id: string
  type: EvidenceType
  evidenceUrl: string
  shortLabel: string
}

type CandidateProject = {
  id: string
  title: string
  description: string | null
  skills: string[]
  createdAt: string
  evidence: CandidateEvidence[]
}

type CandidateProfile = {
  id: string
  name: string
  headline?: string | null
  bio: string | null
  cvUrl: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  projects: CandidateProject[]
}

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Minimal structural check on a successful response body — guards against
// a malformed/empty 200 body crashing the page (missing `projects`) or
// leaving it stuck on the loading state forever (a falsy body).
function isCandidateProfileShape(value: unknown): value is CandidateProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { name?: unknown }).name === "string" &&
    Array.isArray((value as { projects?: unknown }).projects)
  )
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

function EvidenceTypeIcon({ type }: { type: EvidenceType }) {
  let path: React.ReactNode

  switch (type) {
    case "github":
      path = (
        <>
          <path d="M9 6L4 12L9 18" />
          <path d="M15 6L20 12L15 18" />
        </>
      )
      break
    case "demo":
      path = (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="currentColor" />
        </>
      )
      break
    case "documentation":
      path = (
        <>
          <path d="M7 3H14L18 7V21H7V3Z" />
          <path d="M14 3V7H18" />
          <path d="M9.5 12H15.5" />
          <path d="M9.5 15.5H15.5" />
        </>
      )
      break
    case "other":
      path = (
        <>
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
        </>
      )
      break
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2F6F52]/10 text-[#2F6F52]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {path}
      </svg>
    </span>
  )
}

function PublicHeader() {
  return (
    <header className="bg-[#16231F] text-[#F6F4EE]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/projects"
            className="flex items-center gap-1 text-[13px] text-[#F6F4EE]/75 no-underline hover:text-[#F6F4EE] focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2 focus-visible:rounded-sm"
          >
            <span aria-hidden="true">←</span> Browse verified projects
          </Link>
          <div className="flex items-center gap-2">
            <CheckBadge />
            <span className="text-lg font-semibold" style={serif}>
              SkillProof
            </span>
          </div>
        </div>
        <Link
          href="/signin"
          className="rounded border border-[#F6F4EE]/35 px-2.5 py-1.5 text-sm text-[#F6F4EE] hover:bg-[#F6F4EE]/10 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
        >
          Sign in
        </Link>
      </div>
    </header>
  )
}

// Project rows fade + rise in once on load, with a small stagger — a plain
// ease-out (not the decision screen's overshoot, not the search page's fast
// per-keystroke transition) since this only ever happens once per visit.
function ProjectRow({
  project,
  delayMs,
  reducedMotion,
}: {
  project: CandidateProject
  delayMs: number
  reducedMotion: boolean
}) {
  const [shown, setShown] = useState(reducedMotion)

  useEffect(() => {
    if (reducedMotion) return
    const timer = setTimeout(() => setShown(true), 20)
    return () => clearTimeout(timer)
    // Runs once on mount only — intentionally kicks off a single
    // entrance transition rather than tracking `reducedMotion` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const duration = reducedMotion ? 1 : 420
  const delay = reducedMotion ? 0 : delayMs

  return (
    <li
      className="border-b border-[#D8D3C4] py-3.5"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(8px)",
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      <div className="flex flex-col gap-1">
        <p
          className="break-words text-[14.5px] font-medium text-[#16231F]"
          style={serif}
        >
          {project.title}
        </p>
        <p className="text-[12.5px] text-[#16231F]/55">
          Verified project · {formatDate(project.createdAt)}
        </p>
        {project.description && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[#16231F]/60">
            {project.description}
          </p>
        )}
        {project.skills?.length > 0 && (
          <div className="mt-1">
            <SkillChips skills={project.skills} />
          </div>
        )}
        {project.evidence?.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {project.evidence.map((ev) =>
              isSafeExternalUrl(ev.evidenceUrl) ? (
                <li key={ev.id}>
                  <a
                    href={ev.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#2F6F52] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
                  >
                    <EvidenceTypeIcon type={ev.type} />
                    {ev.shortLabel}
                  </a>
                </li>
              ) : null
            )}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function PublicCandidateProfilePage() {
  const reducedMotion = useReducedMotion()
  const params = useParams<{ id: string }>()
  const candidateId = params.id

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null)
  const [loadError, setLoadError] = useState<{
    status: number
    message: string
  } | null>(null)

  const [interestStatus, setInterestStatus] = useState<
    "idle" | "loading" | "success"
  >("idle")

  const [shortlistStatus, setShortlistStatus] = useState<
    "idle" | "loading" | "success"
  >("idle")

  const [actionError, setActionError] = useState<string | null>(null)
  const [isRecruiter, setIsRecruiter] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/candidates/${candidateId}`)
        const data = await res.json().catch(() => ({}))

        if (cancelled) return

        if (!res.ok) {
          setLoadError({
            status: res.status,
            message:
              (data as { error?: string }).error ??
              "Something went wrong. Please try again.",
          })
          return
        }

        if (!isCandidateProfileShape(data)) {
          setLoadError({
            status: res.status,
            message: "Something went wrong. Please try again.",
          })
          return
        }

        setCandidate(data)
      } catch {
        if (!cancelled) {
          setLoadError({
            status: 0,
            message: "Something went wrong. Please try again.",
          })
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [candidateId])

  useEffect(() => {
    let cancelled = false

    async function loadRecruiterInterestState() {
      try {
        const res = await fetch("/api/recruiter/interests")
        const data = await res.json().catch(() => ({}))

        if (cancelled) return

        if (res.status === 401 || res.status === 403) {
          setIsRecruiter(false)
          return
        }

        if (!res.ok) {
          setIsRecruiter(false)
          return
        }

        const candidateIds = Array.isArray(
          (data as { candidateIds?: unknown }).candidateIds
        )
          ? (data as { candidateIds: unknown[] }).candidateIds
          : []

        setIsRecruiter(true)

        if (candidateIds.includes(candidateId)) {
          setInterestStatus("success")
        }
      } catch {
        if (!cancelled) {
          setIsRecruiter(false)
        }
      }
    }

    loadRecruiterInterestState()

    return () => {
      cancelled = true
    }
  }, [candidateId])
  useEffect(() => {
  let cancelled = false

  async function loadRecruiterShortlistState() {
    setShortlistStatus("idle")

    try {
      const res = await fetch("/api/recruiter/shortlist")
      const data = await res.json().catch(() => ({}))

      if (cancelled) return

      if (!res.ok) {
        return
      }

      const candidateIds = Array.isArray(
        (data as { candidateIds?: unknown }).candidateIds
      )
        ? (data as { candidateIds: unknown[] }).candidateIds
        : []

      if (candidateIds.includes(candidateId)) {
        setShortlistStatus("success")
      }
    } catch {
      // Leave the shortlist button in its default state
      // if the initial status request fails.
    }
  }

  loadRecruiterShortlistState()

  return () => {
    cancelled = true
  }
}, [candidateId])

  async function handleInterest() {
    setInterestStatus("loading")
    setActionError(null)

    try {
      const res = await fetch("/api/recruiter/interests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        setInterestStatus("success")
        return
      }

      if (!res.ok) {
        setActionError(
          (data as { error?: string }).error ??
          "Something went wrong. Please try again."
        )
        setInterestStatus("idle")
        return
      }

      setInterestStatus("success")
    } catch {
      setActionError("Something went wrong. Please try again.")
      setInterestStatus("idle")
    }
  }

  async function handleShortlist() {
    const removing = shortlistStatus === "success"

    setShortlistStatus("loading")
    setActionError(null)

    try {
      const res = await fetch(
        `/api/recruiter/shortlist/${candidateId}`,
        {
          method: removing ? "DELETE" : "POST",
        }
      )

      const data = await res.json().catch(() => ({}))

      // Duplicate add means the desired state is already true.
      if (!removing && res.status === 409) {
        setShortlistStatus("success")
        return
      }

      // Missing remove means the desired state is already false.
      if (removing && res.status === 404) {
        setShortlistStatus("idle")
        return
      }

      if (!res.ok) {
        setActionError(
          (data as { error?: string }).error ??
          "Something went wrong. Please try again."
        )
        setShortlistStatus(removing ? "success" : "idle")
        return
      }

      setShortlistStatus(removing ? "idle" : "success")
    } catch {
      setActionError("Something went wrong. Please try again.")
      setShortlistStatus(removing ? "success" : "idle")
    }
  }
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F6F4EE] text-[#16231F]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-8">
          <div
            role="alert"
            className="rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
          >
            {loadError.status === 404
              ? "Candidate not found."
              : loadError.message}
          </div>
          <Link
            href="/projects"
            className="mt-4 inline-block text-[13px] text-[#2F6F52] font-medium border-b border-[#6FAE8E] pb-px no-underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
          >
            <span aria-hidden="true">←</span> Browse verified projects
          </Link>
        </main>
      </div>
    )
  }

  if (candidate === null) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F6F4EE] text-[#16231F]">
        <PublicHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-8">
          <p role="status" className="text-[13px] text-[#16231F]/55">Loading…</p>
        </main>
      </div>
    )
  }

  const verifiedCount = candidate.projects.length
  const hasSafeCvUrl = Boolean(
    candidate.cvUrl && isSafeExternalUrl(candidate.cvUrl)
  )
  // Only http(s) links are ever rendered (javascript: etc. are dropped).
  const profileLinks = [
    { label: "GitHub", url: candidate.githubUrl },
    { label: "LinkedIn", url: candidate.linkedinUrl },
    { label: "Portfolio", url: candidate.portfolioUrl },
  ].filter(
    (link): link is { label: string; url: string } =>
      Boolean(link.url) && isSafeExternalUrl(link.url as string)
  )
  const hasProfileDetails =
    Boolean(candidate.bio) || hasSafeCvUrl || profileLinks.length > 0

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4EE] text-[#16231F]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-8">
        <h1
          className="break-words text-[22px] font-semibold text-[#16231F]"
          style={serif}
        >
          {candidate.name}
        </h1>

        {candidate.headline && (
          <p className="mt-1 break-words text-[14.5px] text-[#16231F]/70">
            {candidate.headline}
          </p>
        )}

        <div className="mt-2.5 flex items-center gap-1.5 rounded-full border border-[#2F6F52]/25 bg-[#2F6F52]/[0.08] px-2.5 py-1 text-[12px] font-medium text-[#2F6F52]">
          <CheckBadge className="h-3.5 w-3.5 bg-[#2F6F52]" strokeWidth={3} />
          {verifiedCount} {verifiedCount === 1 ? "verified project" : "verified projects"}
        </div>

        {hasProfileDetails && (
          <div className="mt-4 flex max-w-xl flex-col gap-3">
            {candidate.bio && (
              <p className="text-[14px] leading-relaxed text-[#16231F]/75">
                {candidate.bio}
              </p>
            )}
            {candidate.cvUrl && isSafeExternalUrl(candidate.cvUrl) && (
              <a
                href={candidate.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-[#2F6F52] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                <DocumentIcon />
                View CV
              </a>
            )}
            {profileLinks.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {profileLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-[#2F6F52] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        {isRecruiter && (
          <>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleInterest}
                disabled={
                  interestStatus === "loading" ||
                  interestStatus === "success"
                }
                className="rounded bg-[#16231F] px-4 py-2.5 text-[13px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
              >
                {interestStatus === "loading"
                  ? "Sending..."
                  : interestStatus === "success"
                    ? "Interested ✓"
                    : "Express interest"}
              </button>

              <button
                type="button"
                onClick={handleShortlist}
                disabled={shortlistStatus === "loading"}
                className="rounded border border-[#D8D3C4] bg-white/30 px-4 py-2.5 text-[13px] font-medium text-[#16231F] transition-colors hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
              >
                {shortlistStatus === "loading"
                  ? "Saving..."
                  : shortlistStatus === "success"
                    ? "Shortlisted ✓"
                    : "Add to shortlist"}
              </button>
            </div>

            {actionError && (
              <div
                role="alert"
                className="mt-3 max-w-xl rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
              >
                {actionError}
              </div>
            )}
          </>
        )}
        <h2
          className={`text-[17px] font-semibold text-[#16231F] ${hasProfileDetails ? "mt-8" : "mt-6"}`}
          style={serif}
        >
          Verified Projects
        </h2>
        <p className="mt-1 text-[13px] text-[#16231F]/55">
          Work {candidate.name} has published and had independently verified.
        </p>

        {verifiedCount === 0 ? (
          <EmptyState
            headline="No verified projects yet"
            description="Check back once this candidate has published verified work."
          />
        ) : (
          <ul className="mt-4 border-t border-[#D8D3C4]">
            {candidate.projects.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                delayMs={Math.min(40 + index * 70, 400)}
                reducedMotion={reducedMotion}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
