"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { getSession } from "next-auth/react"

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
  publishedState: ProjectStatus
  verificationStatus: VerificationStatus
  reviewerFeedback: string | null
  evidence: Evidence[]
}
const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

const EVIDENCE_TYPE_OPTIONS: { value: EvidenceType; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "demo", label: "Demo" },
  { value: "documentation", label: "Documentation" },
  { value: "other", label: "Other" },
]

function Spinner({
  className = "border-[#F6F4EE]/35 border-t-[#F6F4EE]",
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

const inputBase =
  "w-full rounded border bg-[#F6F4EE] px-3 py-2.5 text-[14px] text-[#16231F] outline-none transition-colors placeholder:text-[#16231F]/35 focus:border-[#2F6F52] focus:ring-1 focus:ring-[#2F6F52]"

function inputClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-[#A8452E]" : "border-[#D8D3C4]"}`
}

const labelClass = "block text-[13px] font-medium text-[#16231F]/70 mb-1"
const fieldErrorClass = "mt-1 text-[12.5px] text-[#A8452E]"

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
    <div className="mt-3 max-w-full overflow-hidden rounded border border-[#D8D3C4]">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#16231F] px-4 py-2.5 text-[#F6F4EE]">
        <span className="font-mono text-[11px] tracking-wide text-[#F6F4EE]/55">
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
          className="break-words text-[16px] font-semibold text-[#16231F]"
          style={serif}
        >
          {title}
        </h3>
        <p className="mt-1 text-[12.5px] text-[#16231F]/55">
          Submitted by {candidateName ?? "you"}
        </p>

        {evidence.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {evidence.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-2 text-[13px] text-[#16231F]"
              >
                <EvidenceTypeIcon type={ev.type} />
                {ev.shortLabel}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[12px] italic text-[#16231F]/50">
          No verifier score yet — will appear here once reviewed.
        </p>
      </div>
    </div>
  )
}

export default function EditProjectPage() {
  const params = useParams<{ projectId: string }>()
  const projectId = params.projectId

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loadError, setLoadError] = useState<{
    status: number
    message: string
  } | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
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

      setProject((prev) => (prev ? { ...prev, title, description } : prev))
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
          className="rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2.5 text-[13px] text-[#A8452E]"
        >
          {loadError.status === 404
            ? "This project doesn't exist."
            : loadError.status === 403
              ? "You don't have access to this project."
              : loadError.message}
        </div>
        <Link
          href="/candidate/projects"
          className="mt-4 inline-block text-[13px] font-medium text-[#2F6F52] hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
        >
          ← Back to my projects
        </Link>
      </main>
    )
  }

  if (!project) {
    return (
      <main>
        <p className="text-[13px] text-[#16231F]/55">Loading…</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
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
              className="rounded border border-[#2F6F52] px-3 py-1 text-[12.5px] font-medium text-[#2F6F52] transition-colors hover:bg-[#2F6F52]/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
            >
              {publishing ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner className="border-[#2F6F52]/35 border-t-[#2F6F52]" />
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
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-[#D8D3C4] px-3 py-2.5">
          <span className="text-[12.5px] text-[#16231F]/70">
            This project has no evidence attached — recruiters won&apos;t
            have anything to review. Publish anyway?
          </span>
          <button
            type="button"
            onClick={confirmPublishAnyway}
            className="rounded border border-[#2F6F52] px-2 py-1 text-[12px] font-medium text-[#2F6F52] hover:bg-[#2F6F52]/10 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
          >
            Publish anyway
          </button>
          <button
            type="button"
            onClick={() => setConfirmingPublish(false)}
            className="rounded border border-[#D8D3C4] px-2 py-1 text-[12px] font-medium text-[#16231F]/55 hover:bg-[#16231F]/5 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
          >
            Cancel
          </button>
        </div>
      )}

      {publishError && (
        <div
          role="alert"
          className="mt-3 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
        >
          {publishError}
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          className="mt-4 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
        >
          {saveError}
        </div>
      )}

{project.reviewerFeedback && (
  <section className="mt-4 rounded border border-[#D8D3C4] bg-[#16231F]/[0.03] p-4">
    <h2
      className="text-[15px] font-semibold text-[#16231F]"
      style={serif}
    >
      Reviewer feedback
    </h2>

    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-[#16231F]/70">
      {project.reviewerFeedback}
    </p>
  </section>
)}

{project.verificationStatus === "rejected" && (
  <div
    role="alert"
    className="mt-4 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-4 py-3"
  >
    <p className="text-[13px] font-semibold text-[#A8452E]">
      This project was rejected.
    </p>

    <p className="mt-1 text-[12.5px] leading-5 text-[#16231F]/70">
      Review the feedback, make the necessary changes to your project,
      and submit it again for verification.
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
            <span className="font-normal text-[#16231F]/45">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass(false)}
          />
        </div>

        <div className="mt-1 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[#16231F] px-4 py-2.5 text-[14px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
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
            <span className="text-[13px] font-medium text-[#2F6F52]">
              Saved
            </span>
          )}
        </div>
      </form>

      <hr className="my-7 border-[#D8D3C4]" />

      <h2 className="text-[16px] font-semibold text-[#16231F]" style={serif}>
        Evidence
      </h2>

      {deleteError && (
        <div
          role="alert"
          className="mt-3 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
        >
          {deleteError}
        </div>
      )}

      {project.evidence.length === 0 ? (
        <p className="mt-3 text-[13px] text-[#16231F]/55">
          No evidence links yet.
        </p>
      ) : (
        <ul className="mt-3 border-t border-[#D8D3C4]">
          {project.evidence.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-col gap-2 border-b border-[#D8D3C4] py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5">
                  <EvidenceTypeIcon type={ev.type} />
                  <span className="text-[11px] font-medium capitalize text-[#16231F]/65">
                    {ev.type}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-[#16231F]">
                    {ev.shortLabel}
                  </div>
                  <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#16231F]/55 sm:max-w-[320px]">
                    {ev.evidenceUrl}
                  </div>
                </div>
              </div>
              {confirmingDeleteId === ev.id ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
                  <span className="text-[12.5px] text-[#16231F]/70">
                    Remove this link?
                  </span>
                  <button
                    type="button"
                    onClick={() => confirmRemoveEvidence(ev.id)}
                    className="rounded border border-[#A8452E] px-2 py-1 text-[12px] font-medium text-[#A8452E] hover:bg-[#A8452E]/10 focus-visible:outline-2 focus-visible:outline-[#A8452E] focus-visible:outline-offset-2"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(null)}
                    className="rounded border border-[#D8D3C4] px-2 py-1 text-[12px] font-medium text-[#16231F]/55 hover:bg-[#16231F]/5 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(ev.id)}
                  disabled={removingId === ev.id}
                  className="shrink-0 self-start text-[12.5px] font-medium text-[#A8452E] hover:underline disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#A8452E] focus-visible:outline-offset-2 focus-visible:rounded-sm sm:self-auto"
                >
                  {removingId === ev.id ? "Removing…" : "Remove"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-5 flex flex-col gap-[13px] rounded border border-[#D8D3C4] p-4"
        onSubmit={handleAddEvidence}
        noValidate
        aria-busy={addingEvidence}
      >
        <p className="text-[13px] font-medium text-[#16231F]">
          Add evidence
        </p>

        {evidenceFormError && (
          <div
            role="alert"
            className="rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
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
            className="w-full rounded bg-[#16231F] px-4 py-2.5 text-[14px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2 sm:w-auto"
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

      <hr className="my-7 border-[#D8D3C4]" />

      <button
        type="button"
        onClick={() => setPreviewOpen((prev) => !prev)}
        className="text-[13px] font-medium text-[#2F6F52] hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
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

      <Link
        href="/candidate/projects"
        className="mt-6 inline-block text-[13px] font-medium text-[#16231F]/60 hover:text-[#16231F] focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
      >
        ← Back to my projects
      </Link>
    </main>
  )
}
