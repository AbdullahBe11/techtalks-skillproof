"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { isSafeExternalUrl } from "@/lib/validation"
import { RUBRIC_CRITERIA, SCORE_MAX, SCORE_MIN } from "@/lib/rubric"

type EvidenceType = "github" | "demo" | "documentation" | "other"
type VerificationStatus = "pending" | "verified" | "rejected"

type Evidence = {
  id: string
  type: EvidenceType
  shortLabel: string
  evidenceUrl: string
}

type ProjectForReview = {
  id: string
  title: string
  description: string | null
  createdAt: string
  candidateName: string
  verificationStatus: VerificationStatus
  reviewerFeedback: string | null
  evidence: Evidence[]
}

type Outcome = "verified" | "rejected"

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

const labelClass = "block text-[13px] font-medium text-ink/70 mb-1"

const inputBase =
  "w-full rounded border bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand focus:ring-1 focus:ring-brand"

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

function Spinner({
  className = "border-paper/35 border-t-paper",
}: {
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`h-3.5 w-3.5 animate-spin rounded-full border-2 ${className}`}
    />
  )
}

function EvidenceTypeIcon({ type }: { type: EvidenceType }) {
  let path: ReactNode

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
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 13L9.5 17.5L19 7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6L18 18" />
      <path d="M18 6L6 18" />
    </svg>
  )
}

// Fades + rises into place on mount, using a double-rAF so the browser
// paints the "before" state first and the transition actually runs.
function FadeUp({
  delayMs,
  reducedMotion,
  className,
  children,
}: {
  delayMs: number
  reducedMotion: boolean
  className?: string
  children: ReactNode
}) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  const duration = reducedMotion ? 1 : 260
  const delay = reducedMotion ? 0 : delayMs

  return (
    <div
      className={className}
      style={{
        opacity: entered ? 1 : 0,
        transform: reducedMotion
          ? "none"
          : entered
            ? "translateY(0)"
            : "translateY(6px)",
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// Approval gets a reserved overshoot curve — a rare, once-per-project moment.
// Rejection uses the same structure but the plain, calmer ease-out used
// everywhere else in this UI.
function ResultBadge({
  outcome,
  reducedMotion,
}: {
  outcome: Outcome
  reducedMotion: boolean
}) {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
  }, [])

  const isApprove = outcome === "verified"
  const color = isApprove ? "var(--brand)" : "var(--danger)"
  const duration = reducedMotion ? 1 : 480
  const easing = reducedMotion
    ? "linear"
    : isApprove
      ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
      : "cubic-bezier(0.23, 1, 0.32, 1)"

  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: 52,
        height: 52,
        borderWidth: 1.5,
        borderStyle: "solid",
        borderColor: color,
        color,
        opacity: entered ? 1 : 0,
        transform: reducedMotion
          ? "none"
          : entered
            ? "scale(1)"
            : "scale(0.5)",
        transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
      }}
    >
      {isApprove ? <CheckIcon /> : <XIcon />}
    </span>
  )
}

function DecisionResult({
  outcome,
  reducedMotion,
}: {
  outcome: Outcome
  reducedMotion: boolean
}) {
  const isApprove = outcome === "verified"

  return (
    <div
      className="flex flex-col items-center gap-3 py-8 text-center"
      aria-live="polite"
    >
      <ResultBadge outcome={outcome} reducedMotion={reducedMotion} />
      <FadeUp delayMs={120} reducedMotion={reducedMotion}>
        <p className="text-[17px] font-semibold text-ink" style={serif}>
          {isApprove ? "Project verified" : "Project rejected"}
        </p>
      </FadeUp>
      <FadeUp delayMs={180} reducedMotion={reducedMotion}>
        <p className="max-w-[280px] text-[13px] text-ink/60">
          {isApprove
            ? "The candidate will see this project marked as verified, along with your feedback."
            : "The candidate will see this project marked as rejected, along with your feedback."}
        </p>
      </FadeUp>
      <Link
        href="/verifier/queue"
        className="mt-2 text-[13px] font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
      >
        ← Back to review queue
      </Link>
    </div>
  )
}

export default function VerifierReviewPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId

  const [project, setProject] = useState<ProjectForReview | null>(null)
  const [loadError, setLoadError] = useState<{
    status: number
    message: string
  } | null>(null)

  const [feedback, setFeedback] = useState("")
  const [scores, setScores] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState<Outcome | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [phase, setPhase] = useState<"form" | "exiting" | "result">("form")
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/for-review`)
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          if (!cancelled) {
            setLoadError({
              status: res.status,
              message:
                (data as { error?: string }).error ??
                "Something went wrong. Please try again.",
            })
          }
          return
        }

        if (!cancelled) setProject(data as ProjectForReview)
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
  }, [projectId])

  const allScored = RUBRIC_CRITERIA.every((c) => scores[c.id] !== undefined)
  const canDecide = feedback.trim().length > 0 && allScored
  const buttonsDisabled = !canDecide || submitting !== null

  async function handleDecision(next: Outcome) {
    if (!canDecide || submitting !== null) return

    setSubmitError(null)
    setSubmitting(next)

    try {
      const res = await fetch(`/api/projects/${projectId}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus: next,
          reviewerFeedback: feedback.trim(),
          scores,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setSubmitError(
          (data as { error?: string }).error ??
            "Something went wrong. Please try again."
        )
        setSubmitting(null)
        return
      }

      setOutcome(next)
      setPhase("exiting")
      window.setTimeout(
        () => setPhase("result"),
        reducedMotion ? 1 : 260
      )
    } catch {
      setSubmitError("Something went wrong. Please try again.")
      setSubmitting(null)
    }
  }

  if (loadError) {
    return (
      <main>
        <div
          role="alert"
          className="rounded border-l-2 border-danger bg-danger/10 px-3 py-2.5 text-[13px] text-danger"
        >
          {loadError.status === 404
            ? "This project doesn't exist."
            : loadError.status === 403
              ? "You don't have access to review this project."
              : loadError.message}
        </div>
        <Link
          href="/verifier/queue"
          className="mt-4 inline-block text-[13px] font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
        >
          ← Back to review queue
        </Link>
      </main>
    )
  }

  if (!project) {
    return (
      <main>
        <p className="text-[13px] text-ink/55">Loading…</p>
      </main>
    )
  }

  const formDuration = reducedMotion ? 1 : 260
  const formEasing = "cubic-bezier(0.23, 1, 0.32, 1)"
  const buttonDuration = reducedMotion ? 1 : 180

  return (
    <main className="max-w-2xl">
      <h1
        className="break-words text-[20px] font-semibold text-ink"
        style={serif}
      >
        {project.title}
      </h1>
      <p className="mt-1 text-[12.5px] text-ink/55">
        Submitted by {project.candidateName} · {formatDate(project.createdAt)}
      </p>

      <p className="mt-1 text-[12px] text-ink/50">
        Your name will be shown publicly on projects you verify.
      </p>

      {project.description && (
        <p className="mt-3 text-[14px] leading-relaxed text-ink/80">
          {project.description}
        </p>
      )}

      {project.verificationStatus !== "pending" && (
        <div className="mt-4 rounded border border-line bg-ink/[0.03] px-3 py-2.5 text-[12.5px] text-ink/70">
          Already {project.verificationStatus === "verified" ? "verified" : "rejected"}
          {project.reviewerFeedback ? ` — "${project.reviewerFeedback}"` : ""}
        </div>
      )}

      <hr className="my-6 border-line" />

      <h2 className="text-[16px] font-semibold text-ink" style={serif}>
        Evidence
      </h2>

      {project.evidence.length === 0 ? (
        <p className="mt-3 text-[13px] text-ink/55">
          No evidence links provided.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {project.evidence.map((ev) => (
            <li
              key={ev.id}
              className="flex min-w-0 items-center gap-2.5 text-[13.5px]"
            >
              <EvidenceTypeIcon type={ev.type} />
              <span className="shrink-0 text-[11px] font-medium capitalize text-ink/65">
                {ev.type}
              </span>
              {isSafeExternalUrl(ev.evidenceUrl) ? (
                <a
                  href={ev.evidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
                >
                  {ev.shortLabel}
                </a>
              ) : (
                // Older evidence saved before URLs were checked: never make an
                // unsafe link clickable.
                <span className="min-w-0 flex-1 truncate text-ink/60">
                  {ev.shortLabel}{" "}
                  <span className="text-[11.5px] text-danger">
                    (link hidden: not an http/https URL)
                  </span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <hr className="my-6 border-line" />

      {phase !== "result" && project.verificationStatus === "pending" && (
        <div
          style={{
            opacity: phase === "exiting" ? 0 : 1,
            transform: reducedMotion
              ? "none"
              : phase === "exiting"
                ? "scale(0.97)"
                : "scale(1)",
            transition: `opacity ${formDuration}ms ${formEasing}, transform ${formDuration}ms ${formEasing}`,
          }}
        >
          <h2
            className="text-[16px] font-semibold text-ink"
            style={serif}
          >
            Decision
          </h2>

          <fieldset className="mt-3" disabled={submitting !== null}>
            <legend className={labelClass}>
              Rubric scores ({SCORE_MIN} = weak, {SCORE_MAX} = excellent)
            </legend>
            <div className="mt-1 flex flex-col gap-3">
              {RUBRIC_CRITERIA.map((criterion) => (
                <div
                  key={criterion.id}
                  role="radiogroup"
                  aria-label={criterion.name}
                  className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      {criterion.name}
                    </p>
                    <p className="text-[12px] text-ink/55">
                      {criterion.description}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {Array.from(
                      { length: SCORE_MAX - SCORE_MIN + 1 },
                      (_, i) => SCORE_MIN + i
                    ).map((value) => {
                      const selected = scores[criterion.id] === value
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          aria-label={`${criterion.name}: ${value}`}
                          onClick={() =>
                            setScores((prev) => ({
                              ...prev,
                              [criterion.id]: value,
                            }))
                          }
                          className={`h-8 w-8 rounded border text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed ${
                            selected
                              ? "border-brand bg-brand text-paper"
                              : "border-line text-ink/70 hover:bg-ink/5"
                          }`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="mt-4">
            <label htmlFor="feedback" className={labelClass}>
              Feedback
            </label>
            <textarea
              id="feedback"
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className={`${inputBase} border-line`}
              placeholder="Share what you found, and why you're approving or rejecting this project…"
              disabled={submitting !== null}
            />
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-3 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
            >
              {submitError}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleDecision("verified")}
              disabled={buttonsDisabled}
              style={{
                opacity: canDecide ? 1 : 0.4,
                pointerEvents: canDecide ? "auto" : "none",
                transition: `opacity ${buttonDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
              }}
              className="rounded bg-brand px-4 py-2.5 text-[14px] font-medium text-paper transition-colors hover:bg-brand/90 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              {submitting === "verified" ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="border-paper/35 border-t-paper" />
                  Approving…
                </span>
              ) : (
                "Approve"
              )}
            </button>
            <button
              type="button"
              onClick={() => handleDecision("rejected")}
              disabled={buttonsDisabled}
              style={{
                opacity: canDecide ? 1 : 0.4,
                pointerEvents: canDecide ? "auto" : "none",
                transition: `opacity ${buttonDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
              }}
              className="rounded border border-danger px-4 py-2.5 text-[14px] font-medium text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2"
            >
              {submitting === "rejected" ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="border-danger/35 border-t-danger" />
                  Rejecting…
                </span>
              ) : (
                "Reject"
              )}
            </button>
          </div>
        </div>
      )}

      {phase === "result" && outcome && (
        <DecisionResult outcome={outcome} reducedMotion={reducedMotion} />
      )}

      {phase !== "result" && (
        <Link
          href="/verifier/queue"
          className="mt-6 inline-block text-[13px] font-medium text-ink/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
        >
          ← Back to review queue
        </Link>
      )}
    </main>
  )
}
