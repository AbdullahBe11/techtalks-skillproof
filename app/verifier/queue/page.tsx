"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import EmptyState from "@/app/components/EmptyState"
import { PENDING_CLASS, PENDING_LABEL } from "./status"

type PendingProject = {
  id: string
  title: string
  createdAt: string
  candidateName: string
}

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function PendingTag() {
  return (
    <span
      className={`inline-flex shrink-0 self-start items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium sm:self-auto ${PENDING_CLASS}`}
    >
      {PENDING_LABEL}
    </span>
  )
}

function PageHeader({ count }: { count?: number }) {
  return (
    <div>
      <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
        Review Queue
      </h1>
      {count !== undefined && (
        <p className="mt-0.5 text-[12.5px] text-[#16231F]/55">
          {count} {count === 1 ? "project" : "projects"} awaiting review
        </p>
      )}
    </div>
  )
}

export default function VerifierQueuePage() {
  const [projects, setProjects] = useState<PendingProject[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/projects/pending")
        const data = await res.json().catch(() => [])

        if (!res.ok) {
          if (!cancelled) {
            setError(
              (data as { error?: string }).error ??
                "Something went wrong. Please try again."
            )
          }
          return
        }

        if (!cancelled) setProjects(data as PendingProject[])
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
          className="mt-4 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
        >
          {error}
        </div>
      </main>
    )
  }

  if (projects === null) {
    return (
      <main>
        <PageHeader />
        <p className="mt-4 text-[13px] text-[#16231F]/55">Loading…</p>
      </main>
    )
  }

  if (projects.length === 0) {
    return (
      <main>
        <PageHeader count={0} />
        <EmptyState
          headline="Queue is clear"
          description="No projects are waiting for review right now."
        />
      </main>
    )
  }

  return (
    <main>
      <PageHeader count={projects.length} />

      <ul className="mt-6 border-t border-[#D8D3C4]">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-col gap-1.5 border-b border-[#D8D3C4] py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
          >
            <div className="min-w-0">
              <Link
                href={`/verifier/queue/${project.id}`}
                className="break-words text-[14.5px] font-medium text-[#16231F] no-underline hover:text-[#2F6F52] focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
                style={serif}
              >
                {project.title}
              </Link>
              <p className="mt-0.5 text-[12.5px] text-[#16231F]/55">
                {project.candidateName} · Submitted{" "}
                {formatDate(project.createdAt)}
              </p>
            </div>
            <PendingTag />
          </li>
        ))}
      </ul>
    </main>
  )
}
