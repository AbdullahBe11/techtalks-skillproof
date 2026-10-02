"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { BIO_MAX_LENGTH, HEADLINE_MAX_LENGTH } from "@/lib/profile"

type Profile = {
  userId: string
  headline: string | null
  bio: string | null
  cvUrl: string | null
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
}

type FormState = {
  headline: string
  bio: string
  cvUrl: string
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
}

const EMPTY_FORM: FormState = {
  headline: "",
  bio: "",
  cvUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
}

const LINK_FIELDS: {
  key: keyof FormState
  label: string
  placeholder: string
}[] = [
  { key: "githubUrl", label: "GitHub", placeholder: "https://github.com/your-name" },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-name" },
  { key: "portfolioUrl", label: "Portfolio", placeholder: "https://your-site.com" },
  { key: "cvUrl", label: "CV", placeholder: "https://link-to-your-cv.pdf" },
]

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

const labelClass = "block text-[13px] font-medium text-[#16231F]/70 mb-1"
const inputClass =
  "w-full rounded border border-[#D8D3C4] bg-[#F6F4EE] px-3 py-2.5 text-[14px] text-[#16231F] outline-none transition-colors placeholder:text-[#16231F]/35 focus:border-[#2F6F52] focus:ring-1 focus:ring-[#2F6F52]"

function toForm(profile: Profile): FormState {
  return {
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    cvUrl: profile.cvUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    portfolioUrl: profile.portfolioUrl ?? "",
  }
}

export default function CandidateProfilePage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/profile")
        const data = await res.json().catch(() => ({}))

        if (cancelled) return

        if (!res.ok) {
          setError(
            (data as { error?: string }).error ??
              "Something went wrong. Please try again."
          )
          return
        }

        setForm(toForm(data as Profile))
        setUserId((data as Profile).userId)
      } catch {
        if (!cancelled) setError("Something went wrong. Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  function update(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          (data as { error?: string }).error ??
            "Something went wrong. Please try again."
        )
        return
      }

      setForm(toForm(data as Profile))
      setSaved(true)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
          My Profile
        </h1>
        {userId && (
          <Link
            href={`/candidates/${userId}`}
            className="text-[13px] font-medium text-[#2F6F52] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
          >
            View public profile →
          </Link>
        )}
      </div>
      <p className="mt-0.5 text-[12.5px] text-[#16231F]/55">
        This is what recruiters see next to your verified projects.
      </p>

      {loading ? (
        <p role="status" className="mt-6 text-[13px] text-[#16231F]/55">
          Loading…
        </p>
      ) : (
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="headline" className={labelClass}>
              Headline
            </label>
            <input
              id="headline"
              type="text"
              value={form.headline}
              maxLength={HEADLINE_MAX_LENGTH}
              placeholder="e.g. Junior Full-Stack Developer"
              onChange={(e) => update("headline", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="bio" className={labelClass}>
              About you
            </label>
            <textarea
              id="bio"
              rows={5}
              value={form.bio}
              maxLength={BIO_MAX_LENGTH}
              placeholder="A few sentences about what you build and what you're looking for."
              onChange={(e) => update("bio", e.target.value)}
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-right text-[11.5px] text-[#16231F]/45">
              {form.bio.length}/{BIO_MAX_LENGTH}
            </p>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-[13px] font-semibold text-[#16231F]">
              Links
            </legend>
            {LINK_FIELDS.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className={labelClass}>
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type="url"
                  inputMode="url"
                  value={form[field.key]}
                  placeholder={field.placeholder}
                  onChange={(e) => update(field.key, e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </fieldset>

          {error && (
            <div
              role="alert"
              className="rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
            >
              {error}
            </div>
          )}
          {saved && (
            <p role="status" className="text-[13px] font-medium text-[#2F6F52]">
              Profile saved ✓
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded bg-[#16231F] px-4 py-2.5 text-[13px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      )}
    </main>
  )
}
