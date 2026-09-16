"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import EmptyState from "@/app/components/EmptyState"

type ProjectSummary = {
  id: string
  title: string
  description: string | null
  publishedState: "draft" | "published" | "archived"
  createdAt: string
  evidenceCount: number
}

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

const STATUS_LABEL: Record<ProjectSummary["publishedState"], string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
}

const STATUS_CLASS: Record<ProjectSummary["publishedState"], string> = {
  draft: "bg-[#B8862F]/10 text-[#B8862F] border-[#B8862F]/30",
  published: "bg-[#2F6F52]/10 text-[#2F6F52] border-[#2F6F52]/30",
  archived: "bg-[#16231F]/5 text-[#16231F]/55 border-[#D8D3C4]",
}

function StatusTag({ state }: { state: ProjectSummary["publishedState"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11.5px] font-medium ${STATUS_CLASS[state]}`}
    >
      {STATUS_LABEL[state]}
    </span>
  )
}

export default function CandidateProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/projects")
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

        if (!cancelled) setProjects(data as ProjectSummary[])
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
        <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
          My Projects
        </h1>
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
        <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
          My Projects
        </h1>
        <p className="mt-4 text-[13px] text-[#16231F]/55">Loading…</p>
      </main>
    )
  }

  if (projects.length === 0) {
    return (
      <main>
        <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
          My Projects
        </h1>
        <EmptyState
          headline="No projects yet"
          description="Submit your first project to start building a verified profile."
        />
      </main>
    )
  }

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-[20px] font-semibold text-[#16231F]"
            style={serif}
          >
            My Projects
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[#16231F]/55">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Link
          href="/candidate/projects/new"
          className="rounded bg-[#16231F] px-3.5 py-2 text-[13px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
        >
          + New project
        </Link>
      </div>

      <ul className="mt-6 border-t border-[#D8D3C4]">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8D3C4] py-3.5"
          >
            <Link
              href={`/candidate/projects/${project.id}`}
              className="text-[14.5px] font-medium text-[#16231F] no-underline hover:text-[#2F6F52] focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
              style={serif}
            >
              {project.title}
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-[12.5px] text-[#16231F]/55">
                {project.evidenceCount}{" "}
                {project.evidenceCount === 1
                  ? "evidence link"
                  : "evidence links"}
              </span>
              <StatusTag state={project.publishedState} />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
