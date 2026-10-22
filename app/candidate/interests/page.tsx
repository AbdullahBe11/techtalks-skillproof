"use client"

import { useEffect, useState } from "react"

import EmptyState from "@/app/components/EmptyState"
import type { InterestedRecruiter } from "@/lib/interests"

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function PageHeader({ count }: { count?: number }) {
  return (
    <div>
      <h1 className="text-[20px] font-semibold text-ink" style={serif}>
        Interested Recruiters
      </h1>
      <p className="mt-0.5 text-[12.5px] text-ink/55">
        {count === undefined
          ? "Recruiters who want to get in touch about your verified work."
          : `${count} ${count === 1 ? "recruiter" : "recruiters"} interested in you`}
      </p>
    </div>
  )
}

export default function CandidateInterestsPage() {
  const [recruiters, setRecruiters] = useState<InterestedRecruiter[] | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/candidate/interests")
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          if (!cancelled) {
            setError(
              (data as { error?: string }).error ??
                "Something went wrong. Please try again."
            )
          }
          return
        }

        const list = (data as { recruiters?: InterestedRecruiter[] })
          .recruiters

        if (!cancelled) setRecruiters(Array.isArray(list) ? list : [])
      } catch {
        if (!cancelled) {
          setError("Something went wrong. Please try again.")
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <main>
        <PageHeader />
        <div
          role="alert"
          className="mt-4 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
        >
          {error}
        </div>
      </main>
    )
  }

  if (recruiters === null) {
    return (
      <main>
        <PageHeader />
        <p role="status" className="mt-4 text-[13px] text-ink/55">
          Loading…
        </p>
      </main>
    )
  }

  if (recruiters.length === 0) {
    return (
      <main>
        <PageHeader count={0} />
        <EmptyState
          headline="No recruiters yet"
          description="When a recruiter expresses interest in your verified projects, they'll appear here with their contact details."
          ctaLabel="View my projects"
          ctaHref="/candidate/projects"
        />
      </main>
    )
  }

  return (
    <main>
      <PageHeader count={recruiters.length} />

      <ul className="mt-6 border-t border-line">
        {recruiters.map((recruiter) => (
          <li
            key={`${recruiter.recruiterEmail}-${recruiter.createdAt}`}
            className="flex flex-col gap-1.5 border-b border-line py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p
                className="break-words text-[14.5px] font-medium text-ink"
                style={serif}
              >
                {recruiter.recruiterName}
              </p>
              <a
                href={`mailto:${recruiter.recruiterEmail}`}
                className="break-all text-[13px] text-brand underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                {recruiter.recruiterEmail}
              </a>
            </div>
            <span className="shrink-0 text-[12.5px] text-ink/55">
              Interested since{" "}
              {dateFormatter.format(new Date(recruiter.createdAt))}
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
