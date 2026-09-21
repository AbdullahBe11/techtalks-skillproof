"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F6F4EE]/35 border-t-[#F6F4EE]"
    />
  )
}

const inputBase =
  "w-full rounded border bg-[#F6F4EE] px-3 py-2.5 text-[14px] text-[#16231F] outline-none transition-colors placeholder:text-[#16231F]/35 focus:border-[#2F6F52] focus:ring-1 focus:ring-[#2F6F52]"

function inputClass(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-[#A8452E]" : "border-[#D8D3C4]"}`
}

const labelClass = "block text-[13px] font-medium text-[#16231F]/70 mb-1"
const fieldErrorClass = "mt-1 text-[12.5px] text-[#A8452E]"

export default function NewProjectPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [titleError, setTitleError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setTitleError("Title is required.")
      return
    }
    setTitleError(null)

    setSubmitting(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      })

      if (res.status === 201) {
        const project = (await res.json()) as { id: string }
        router.push(`/candidate/projects/${project.id}`)
        return
      }

      const data = (await res.json().catch(() => ({}))) as { error?: string }
      const message = data.error ?? "Something went wrong. Please try again."

      if (res.status === 400) {
        setTitleError(message)
      } else {
        setFormError(message)
      }
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg">
      <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
        New Project
      </h1>

      {formError && (
        <div
          role="alert"
          className="mt-4 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
        >
          {formError}
        </div>
      )}

      <form
        className="mt-5 flex flex-col gap-[13px]"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
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
            disabled={submitting}
            className="rounded bg-[#16231F] px-4 py-2.5 text-[14px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner />
                Creating…
              </span>
            ) : (
              "Create project"
            )}
          </button>
          <Link
            href="/candidate/projects"
            className="text-[13px] font-medium text-[#16231F]/60 hover:text-[#16231F] focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}
