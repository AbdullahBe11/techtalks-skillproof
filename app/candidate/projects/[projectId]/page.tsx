"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import SkillsInput from "@/app/components/SkillTags"
import RubricScores from "@/app/components/RubricScores"
import type { ScoreSummary } from "@/lib/rubric"

import {
  STATUS_CLASS,
  STATUS_LABEL,
  VERIFICATION_STATUS_CLASS,
  VERIFICATION_STATUS_LABEL,
  type ProjectStatus,
  type VerificationStatus,
} from "../status"

type EvidenceType = "github" | "demo" | "documentation" | "other"

type Evidence = {
  id: string
  type: EvidenceType
  shortLabel: string
  evidenceUrl: string
}

type ProjectDetail = {
  id: string
  title: string
  description: string | null
  skills: string[]
  publishedState: ProjectStatus
  verificationStatus: VerificationStatus
  reviewerFeedback: string | null
  evidence: Evidence[]
  scores: ScoreSummary | null
}
const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

const EVIDENCE_TYPE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "demo", label: "Demo" },
  { value: "documentation", label: "Documentation" },
  { value: "other", label: "Other" },
]

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

const inputBase =
  "w-full rounded border bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand focus:ring-1 focus:ring-brand"

function inputClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-danger" : "border-line"}`
}

const labelClass = "block text-[13px] font-medium text-ink/70 mb-1"
const fieldErrorClass = "mt-1 text-[12.5px] text-danger"

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function PreviewCard({
  title,
  publishedState,
  evidence,
  candidateName,
}: {
  title: string
  publishedState: ProjectDetail["publishedState"]
  evidence: Evidence[]
  candidateName: string | null
}) {
  return (
    <div className="mt-3 max-w-full overflow-hidden rounded border border-line">
      <div className="chrome flex flex-wrap items-center justify-between gap-2 bg-ink px-4 py-2.5 text-paper">
        <span className="font-mono text-[11px] tracking-wide text-paper/55">
          /profile/preview
        </span>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[publishedState]}`}
        >
          {publishedState === "draft"
            ? "Draft — not visible yet"
            : STATUS_LABEL[publishedState]}
        </span>
      </div>

      <div className="p-4">
        <h3
          className="break-words text-[16px] font-semibold text-ink"
          style={serif}
        >
          {title}
        </h3>
        <p className="mt-1 text-[12.5px] text-ink/55">
          Submitted by {candidateName ?? "you"}
        </p>

        {evidence.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {evidence.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-2 text-[13px] text-ink"
              >
                <EvidenceTypeIcon type={ev.type} />
                {ev.shortLabel}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[12px] italic text-ink/50">
          No verifier score yet — will appear here once reviewed.
        </p>
      </div>
    </div>
  )
}

export default function EditProjectPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId
  const router = useRouter()

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loadError, setLoadError] = useState<{
    status: number
    message: string
  } | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [titleError, setTitleError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [evidenceType, setEvidenceType] = useState<EvidenceType>("github")
  const [shortLabel, setShortLabel] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [shortLabelError, setShortLabelError] = useState<string | null>(null)
  const [evidenceUrlError, setEvidenceUrlError] = useState<string | null>(
    null
  )
  const [evidenceFormError, setEvidenceFormError] = useState<string | null>(
    null
  )
  const [addingEvidence, setAddingEvidence] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  )

  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [confirmingPublish, setConfirmingPublish] = useState(false)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmingProjectDelete, setConfirmingProjectDelete] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [projectDeleteError, setProjectDeleteError] = useState<string | null>(
    null
  )
  const [candidateName, setCandidateName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
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

        if (!cancelled) {
          const loaded = data as ProjectDetail
          setProject(loaded)
          setTitle(loaded.title)
          setDescription(loaded.description ?? "")
          setSkills(loaded.skills ?? [])
        }
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

  useEffect(() => {
    let cancelled = false

    getSession().then((session) => {
      if (!cancelled) setCandidateName(session?.user?.name ?? null)
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaveError(null)
    setSaved(false)

    if (!title.trim()) {
      setTitleError("Title is required.")
      return
    }
    setTitleError(null)

    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          skills,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message =
          (data as { error?: string }).error ??
          "Something went wrong. Please try again."
        if (res.status === 400) {
          setTitleError(message)
        } else {
          setSaveError(message)
        }
        return
      }

      setProject((prev) => (prev ? { ...prev, ...data } : prev))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddEvidence(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEvidenceFormError(null)

    let hasError = false
    if (!shortLabel.trim()) {
      setShortLabelError("Label is required.")
      hasError = true
    } else {
      setShortLabelError(null)
    }

    if (!evidenceUrl.trim() || !isValidUrl(evidenceUrl.trim())) {
      setEvidenceUrlError("Enter a valid URL.")
      hasError = true
    } else {
      setEvidenceUrlError(null)
    }

    if (hasError) return

    setAddingEvidence(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: evidenceType,
          shortLabel: shortLabel.trim(),
          evidenceUrl: evidenceUrl.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.status !== 201) {
        setEvidenceFormError(
          (data as { error?: string }).error ??
            "Something went wrong. Please try again."
        )
        return
      }

      const newEvidence = data as Evidence
      setProject((prev) =>
        prev ? { ...prev, evidence: [...prev.evidence, newEvidence] } : prev
      )
      setShortLabel("")
      setEvidenceUrl("")
      setEvidenceType("github")
      setDeleteError(null)
    } catch {
      setEvidenceFormError("Something went wrong. Please try again.")
    } finally {
      setAddingEvidence(false)
    }
  }

  function confirmRemoveEvidence(evidenceId: string) {
    setConfirmingDeleteId(null)
    handleRemoveEvidence(evidenceId)
  }

  async function handleRemoveEvidence(evidenceId: string) {
    setRemovingId(evidenceId)
    setDeleteError(null)
    try {
      const res = await fetch(
        `/api/projects/${projectId}/evidence/${evidenceId}`,
        { method: "DELETE" }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setDeleteError(
          (data as { error?: string }).error ??
            "Something went wrong removing this evidence. Please try again."
        )
        return
      }

      setProject((prev) =>
        prev
          ? {
              ...prev,
              evidence: prev.evidence.filter((ev) => ev.id !== evidenceId),
            }
          : prev
      )
    } catch {
      setDeleteError(
        "Something went wrong removing this evidence. Please try again."
      )
    } finally {
      setRemovingId(null)
    }
  }

  async function handleDeleteProject() {
    setDeletingProject(true)
    setProjectDeleteError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setProjectDeleteError(
          (data as { error?: string }).error ??
            "Something went wrong deleting this project. Please try again."
        )
        setDeletingProject(false)
        return
      }

      router.push("/candidate/projects")
    } catch {
      setProjectDeleteError(
        "Something went wrong deleting this project. Please try again."
      )
      setDeletingProject(false)
    }
  }

  async function togglePublish(nextStatus: "draft" | "published") {
    setPublishing(true)
    setPublishError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setPublishError(
          (data as { error?: string }).error ??
            "Something went wrong. Please try again."
        )
        return
      }

      setProject((prev) =>
        prev ? { ...prev, publishedState: nextStatus } : prev
      )
    } catch {
      setPublishError("Something went wrong. Please try again.")
    } finally {
      setPublishing(false)
    }
  }

  function handlePublishClick() {
    if (!project) return
    setPublishError(null)

    if (project.publishedState === "published") {
      togglePublish("draft")
      return
    }

    if (project.evidence.length === 0) {
      setConfirmingPublish(true)
      return
    }

    togglePublish("published")
  }

  function confirmPublishAnyway() {
    setConfirmingPublish(false)
    togglePublish("published")
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
              ? "You don't have access to this project."
              : loadError.message}
        </div>
        <Link
          href="/candidate/projects"
          className="mt-4 inline-block text-[13px] font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
        >
          ← Back to my projects
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

  return (
    <main className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold text-ink" style={serif}>
          Edit Project
        </h1>
        <div className="flex items-center gap-2">
  <span
    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium ${STATUS_CLASS[project.publishedState]}`}
  >
    {STATUS_LABEL[project.publishedState]}
  </span>

  <span
    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium ${VERIFICATION_STATUS_CLASS[project.verificationStatus]}`}
  >
    Verification: {VERIFICATION_STATUS_LABEL[project.verificationStatus]}
  </span>

  {project.publishedState !== "archived" && !confirmingPublish && (
            <button
              type="button"
              onClick={handlePublishClick}
              disabled={publishing}
              className="rounded border border-brand px-3 py-1 text-[12.5px] font-medium text-brand transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              {publishing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="border-brand/35 border-t-brand" />
                  {project.publishedState === "published"
                    ? "Unpublishing…"
                    : "Publishing…"}
                </span>
              ) : project.publishedState === "published" ? (
                "Unpublish"
              ) : (
                "Publish"
              )}
            </button>
          )}
        </div>
      </div>

      {confirmingPublish && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-line px-3 py-2.5">
          <span className="text-[12.5px] text-ink/70">
            This project has no evidence attached — recruiters won&apos;t
            have anything to review. Publish anyway?
          </span>
          <button
            type="button"
            onClick={confirmPublishAnyway}
            className="rounded border border-brand px-2 py-1 text-[12px] font-medium text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            Publish anyway
          </button>
          <button
            type="button"
            onClick={() => setConfirmingPublish(false)}
            className="rounded border border-line px-2 py-1 text-[12px] font-medium text-ink/55 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
          >
            Cancel
          </button>
        </div>
      )}

      {publishError && (
        <div
          role="alert"
          className="mt-3 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
        >
          {publishError}
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          className="mt-4 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
        >
          {saveError}
        </div>
      )}

{project.reviewerFeedback && (
  <section className="mt-4 rounded border border-line bg-ink/[0.03] p-4">
    <h2
      className="text-[15px] font-semibold text-ink"
      style={serif}
    >
      Reviewer feedback
    </h2>

    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-ink/70">
      {project.reviewerFeedback}
    </p>

    <RubricScores
      scores={project.verificationStatus === "pending" ? null : project.scores}
      className="mt-3"
    />
  </section>
)}

{project.verificationStatus === "rejected" && (
  <div
    role="alert"
    className="mt-4 rounded border-l-2 border-danger bg-danger/10 px-4 py-3"
  >
    <p className="text-[13px] font-semibold text-danger">
      This project was rejected.
    </p>

    <p className="mt-1 text-[12.5px] leading-5 text-ink/70">
      Review the feedback, make your changes, then click{" "}
      <span className="font-medium">Save changes</span>. Saving your
      changes will resubmit this project for review.
    </p>
  </div>
)}

{project.verificationStatus === "verified" && (
  <div
    role="note"
    className="mt-4 rounded border-l-2 border-brand bg-brand/10 px-4 py-3"
  >
    <p className="text-[13px] font-semibold text-brand">
      This project is verified.
    </p>

    <p className="mt-1 text-[12.5px] leading-5 text-ink/70">
      Changing the title, description or skills will send it back for review,
      and it will be hidden from public pages until it&apos;s verified again.
    </p>
  </div>
)}

      <form
        className="mt-5 flex flex-col gap-[13px]"
        onSubmit={handleSave}
        noValidate
        aria-busy={saving}
      >
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (titleError) setTitleError(null)
            }}
            className={inputClass(Boolean(titleError))}
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? "title-error" : undefined}
          />
          {titleError && (
            <p id="title-error" className={fieldErrorClass}>
              {titleError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description{" "}
            <span className="font-normal text-ink/45">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass(false)}
          />
        </div>

        <div>
          <label htmlFor="skills" className={labelClass}>
            Skills used{" "}
            <span className="font-normal text-ink/45">(optional)</span>
          </label>
          <SkillsInput
            id="skills"
            value={skills}
            onChange={setSkills}
            inputClassName={inputClass(false)}
          />
        </div>

        <div className="mt-1 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-ink px-4 py-2.5 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
          >
            {saving ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner />
                Saving…
              </span>
            ) : (
              "Save changes"
            )}
          </button>
          {saved && (
            <span className="text-[13px] font-medium text-brand">
              Saved
            </span>
          )}
        </div>
      </form>

      <hr className="my-7 border-line" />

      <h2 className="text-[16px] font-semibold text-ink" style={serif}>
        Evidence
      </h2>

      {deleteError && (
        <div
          role="alert"
          className="mt-3 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
        >
          {deleteError}
        </div>
      )}

      {project.evidence.length === 0 ? (
        <p className="mt-3 text-[13px] text-ink/55">
          No evidence links yet.
        </p>
      ) : (
        <ul className="mt-3 border-t border-line">
          {project.evidence.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-col gap-2 border-b border-line py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5">
                  <EvidenceTypeIcon type={ev.type} />
                  <span className="text-[11px] font-medium capitalize text-ink/65">
                    {ev.type}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-ink">
                    {ev.shortLabel}
                  </div>
                  <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-ink/55 sm:max-w-[320px]">
                    {ev.evidenceUrl}
                  </div>
                </div>
              </div>
              {confirmingDeleteId === ev.id ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="text-[12.5px] text-ink/70">
                    Remove this link?
                  </span>
                  <button
                    type="button"
                    onClick={() => confirmRemoveEvidence(ev.id)}
                    className="rounded border border-danger px-2 py-1 text-[12px] font-medium text-danger hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(null)}
                    className="rounded border border-line px-2 py-1 text-[12px] font-medium text-ink/55 hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(ev.id)}
                  disabled={removingId === ev.id}
                  className="shrink-0 self-start text-[12.5px] font-medium text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2 focus-visible:rounded-sm sm:self-auto"
                >
                  {removingId === ev.id ? "Removing…" : "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-5 flex flex-col gap-[13px] rounded border border-line p-4"
        onSubmit={handleAddEvidence}
        noValidate
        aria-busy={addingEvidence}
      >
        <p className="text-[13px] font-medium text-ink">
          Add evidence
        </p>

        {evidenceFormError && (
          <div
            role="alert"
            className="rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
          >
            {evidenceFormError}
          </div>
        )}

        <div className="flex flex-col gap-[13px] sm:flex-row">
          <div className="sm:w-40">
            <label htmlFor="evidenceType" className={labelClass}>
              Type
            </label>
            <select
              id="evidenceType"
              value={evidenceType}
              onChange={(e) =>
                setEvidenceType(e.target.value as EvidenceType)
              }
              className={inputClass(false)}
            >
              {EVIDENCE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="shortLabel" className={labelClass}>
              Label
            </label>
            <input
              id="shortLabel"
              type="text"
              value={shortLabel}
              onChange={(e) => {
                setShortLabel(e.target.value)
                if (shortLabelError) setShortLabelError(null)
              }}
              className={inputClass(Boolean(shortLabelError))}
              aria-invalid={shortLabelError ? true : undefined}
              aria-describedby={
                shortLabelError ? "shortLabel-error" : undefined
              }
            />
            {shortLabelError && (
              <p id="shortLabel-error" className={fieldErrorClass}>
                {shortLabelError}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="evidenceUrl" className={labelClass}>
            URL
          </label>
          <input
            id="evidenceUrl"
            type="text"
            placeholder="https://…"
            value={evidenceUrl}
            onChange={(e) => {
              setEvidenceUrl(e.target.value)
              if (evidenceUrlError) setEvidenceUrlError(null)
            }}
            className={inputClass(Boolean(evidenceUrlError))}
            aria-invalid={evidenceUrlError ? true : undefined}
            aria-describedby={
              evidenceUrlError ? "evidenceUrl-error" : undefined
            }
          />
          {evidenceUrlError && (
            <p id="evidenceUrl-error" className={fieldErrorClass}>
              {evidenceUrlError}
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={addingEvidence}
            className="w-full rounded bg-ink px-4 py-2.5 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2 sm:w-auto"
          >
            {addingEvidence ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner />
                Adding…
              </span>
            ) : (
              "Add"
            )}
          </button>
        </div>
      </form>

      <hr className="my-7 border-line" />

      <button
        type="button"
        onClick={() => setPreviewOpen((prev) => !prev)}
        className="text-[13px] font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
        aria-expanded={previewOpen}
      >
        {previewOpen
          ? "Hide preview"
          : "Preview as recruiters will see it"}
      </button>

      {previewOpen && (
        <PreviewCard
          title={project.title}
          publishedState={project.publishedState}
          evidence={project.evidence}
          candidateName={candidateName}
        />
      )}

      <hr className="my-7 border-line" />

      <section aria-labelledby="delete-project-heading">
        <h2
          id="delete-project-heading"
          className="text-[15px] font-semibold text-ink"
          style={serif}
        >
          Delete project
        </h2>
        <p className="mt-1 text-[12.5px] text-ink/60">
          This removes the project, its evidence and its verification for
          good. It can&apos;t be undone.
        </p>

        {confirmingProjectDelete ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-danger/40 px-3 py-2.5">
            <span className="text-[12.5px] text-ink/70">
              Delete &ldquo;{project.title}&rdquo; permanently?
            </span>
            <button
              type="button"
              onClick={handleDeleteProject}
              disabled={deletingProject}
              className="rounded border border-danger bg-danger px-2 py-1 text-[12px] font-medium text-paper hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2"
            >
              {deletingProject ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingProjectDelete(false)}
              disabled={deletingProject}
              className="rounded border border-line px-2 py-1 text-[12px] font-medium text-ink/55 hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setProjectDeleteError(null)
              setConfirmingProjectDelete(true)
            }}
            className="mt-3 rounded border border-danger px-3 py-1.5 text-[12.5px] font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-danger focus-visible:outline-offset-2"
          >
            Delete project
          </button>
        )}

        {projectDeleteError && (
          <div
            role="alert"
            className="mt-3 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
          >
            {projectDeleteError}
          </div>
        )}
      </section>

      <Link
        href="/candidate/projects"
        className="mt-6 inline-block text-[13px] font-medium text-ink/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
      >
        ← Back to my projects
      </Link>
    </main>
  )
}
