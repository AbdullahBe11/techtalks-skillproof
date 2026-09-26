"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"

import EmptyState from "@/app/components/EmptyState"
import { CheckBadge } from "@/app/components/AppShell"

type PublicProject = {
  id: string
  title: string
  candidateId: string
  candidateName: string
  description: string | null
}

type DisplayRow = PublicProject & {
  included: boolean
  entering: boolean
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

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21L16.65 16.65" />
    </svg>
  )
}

// Cross-fades the displayed text whenever `value` changes, rather than
// swapping it instantly — used for the live result count line.
function useCrossfadeText(value: string, ms: number, reducedMotion: boolean) {
  // Tracks the previous input alongside the displayed value (React's
  // "storing information from previous renders" pattern) instead of a ref,
  // so the comparison stays safe to run during render.
  const [state, setState] = useState({
    prevValue: value,
    shown: value,
    fading: false,
  })

  if (state.prevValue !== value) {
    if (reducedMotion) {
      setState({ prevValue: value, shown: value, fading: false })
    } else {
      setState({ prevValue: value, shown: state.shown, fading: true })
    }
  }

  useEffect(() => {
    if (!state.fading) return
    const timer = setTimeout(() => {
      setState((s) => ({ ...s, shown: value, fading: false }))
    }, ms / 2)
    return () => clearTimeout(timer)
  }, [state.fading, value, ms])

  return { shown: state.shown, opacity: state.fading ? 0 : 1 }
}

function PublicHeader() {
  return (
    <header className="bg-[#16231F] text-[#F6F4EE]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckBadge />
          <span className="text-lg font-semibold" style={serif}>
            SkillProof
          </span>
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

// A single result row. Its own height/opacity animates in and out via the
// CSS Grid `grid-template-rows: 1fr` / `0fr` technique so it collapses in
// place instead of the list jump-cutting on every keystroke.
function ResultRow({
  project,
  included,
  entering,
  reducedMotion,
}: {
  project: PublicProject
  included: boolean
  entering: boolean
  reducedMotion: boolean
}) {
  const [phase, setPhase] = useState<"entering" | "shown">(
    entering ? "entering" : "shown"
  )

  useEffect(() => {
    if (phase !== "entering") return
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("shown"))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
    // Runs once on mount only — `phase` is deliberately left out since it's
    // what this effect itself sets, so tracking it would just re-fire on its
    // own update and break the one-time entering→shown kickoff.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expanded = phase === "entering" ? false : included
  const duration = reducedMotion ? 1 : 200
  const easing = "cubic-bezier(0.23, 1, 0.32, 1)"

  return (
    <li
      className="public-project-row border-b border-[#D8D3C4]"
      style={{
        display: "grid",
        gridTemplateRows: expanded ? "1fr" : "0fr",
        opacity: expanded ? 1 : 0,
        transition: `grid-template-rows ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
      }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="flex flex-col gap-1 py-3.5">
          <Link
            href={`/candidates/${project.candidateId}`}
            className="w-fit break-words text-[14.5px] font-medium text-[#16231F] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
            style={serif}
          >
            {project.title}
          </Link>
          <div className="flex items-center gap-1.5 text-[12.5px] text-[#16231F]/70">
            <CheckBadge className="h-4 w-4 bg-[#2F6F52]" strokeWidth={3} />
            <span>{project.candidateName}</span>
          </div>
          {project.description && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-[#16231F]/60">
              {project.description}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

export default function PublicProjectsPage() {
  const reducedMotion = useReducedMotion()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [results, setResults] = useState<PublicProject[] | null>(null)
  const [displayed, setDisplayed] = useState<DisplayRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const requestIdRef = useRef(0)
  const hasLoadedOnceRef = useRef(false)

  // Debounce the raw input ~300ms before it drives the API query.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch from the real public API on each debounced query change.
  useEffect(() => {
    let cancelled = false
    const requestId = ++requestIdRef.current

    async function load() {
      try {
        const url = debouncedQuery
          ? `/api/public/projects?search=${encodeURIComponent(debouncedQuery)}`
          : "/api/public/projects"
        const res = await fetch(url)
        const data = await res.json().catch(() => [])

        if (cancelled || requestId !== requestIdRef.current) return

        if (!res.ok) {
          setError(
            (data as { error?: string }).error ??
              "Something went wrong. Please try again."
          )
          setInitialLoading(false)
          return
        }

        setError(null)
        setResults(data as PublicProject[])
        setInitialLoading(false)
      } catch {
        if (cancelled || requestId !== requestIdRef.current) return
        setError("Something went wrong. Please try again.")
        setInitialLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  // Merge the latest results into the displayed rows: rows no longer present
  // are marked not-included (so they animate out) instead of vanishing, and
  // genuinely new rows animate in — except on the very first load. The
  // included rows follow `results`' own order exactly (so the list never
  // drifts from the API's newest-first ranking); exiting rows are appended
  // after, since their position doesn't matter while they collapse away.
  useEffect(() => {
    if (results === null) return
    const isFirstLoad = !hasLoadedOnceRef.current
    hasLoadedOnceRef.current = true

    setDisplayed((prev) => {
      const resultIds = new Set(results.map((r) => r.id))
      const prevIds = new Set(prev.map((p) => p.id))

      const included = results.map((r) => ({
        ...r,
        included: true,
        entering: !isFirstLoad && !prevIds.has(r.id),
      }))

      const exiting = prev
        .filter((p) => !resultIds.has(p.id))
        .map((p) => ({ ...p, included: false }))

      return [...included, ...exiting]
    })
  }, [results])

  // Once a row has finished collapsing (not included), drop it from the
  // list entirely so the DOM doesn't keep growing across searches.
  useEffect(() => {
    const hasExiting = displayed.some((d) => !d.included)
    if (!hasExiting) return
    const timer = setTimeout(
      () => {
        setDisplayed((prev) => prev.filter((d) => d.included))
      },
      reducedMotion ? 20 : 240
    )
    return () => clearTimeout(timer)
  }, [displayed, reducedMotion])

  const matchCount = results?.length ?? 0
  const countText =
    matchCount === 1
      ? `1 project matches '${debouncedQuery}'`
      : `${matchCount} projects match '${debouncedQuery}'`
  const { shown: countShown, opacity: countOpacity } = useCrossfadeText(
    countText,
    150,
    reducedMotion
  )

  const showEmptyState =
    !error && !initialLoading && results !== null && results.length === 0 && displayed.length === 0
  const showCount = !error && debouncedQuery.length > 0 && !initialLoading
  const showLoading = !error && initialLoading

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4EE] text-[#16231F]">
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .public-project-row:hover {
            background-color: rgba(22, 35, 31, 0.03);
          }
        }
      `}</style>

      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-8">
        <h1 className="text-[22px] font-semibold text-[#16231F]" style={serif}>
          Browse verified projects
        </h1>
        <p className="mt-1 text-[13px] text-[#16231F]/55">
          Real, verified work from candidates across SkillProof.
        </p>

        <div className="relative mt-5 max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#16231F]/40">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, keyword, or skill…"
            aria-label="Search verified projects"
            className="w-full rounded border border-[#D8D3C4] bg-[#F6F4EE] py-2.5 pl-9 pr-3 text-[14px] text-[#16231F] outline-none transition-colors placeholder:text-[#16231F]/35 focus:border-[#2F6F52] focus:ring-1 focus:ring-[#2F6F52]"
          />
        </div>

        {/* Always mounted (rather than conditionally rendered) so screen
            readers reliably pick up text changes inside an already-present
            live region, instead of possibly missing the initial content of
            a region that only just got inserted into the DOM. */}
        <p
          aria-live="polite"
          className="text-[12.5px] text-[#16231F]/55"
          style={{
            marginTop: showCount ? "0.625rem" : 0,
            height: showCount ? "auto" : 0,
            overflow: "hidden",
            opacity: showCount ? countOpacity : 0,
            transition: reducedMotion ? "none" : "opacity 75ms ease-out",
          }}
        >
          {showCount ? countShown : ""}
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
          >
            {error}
          </div>
        )}

        <p
          aria-live="polite"
          className="text-[13px] text-[#16231F]/55"
          style={{
            marginTop: showLoading ? "1.5rem" : 0,
            height: showLoading ? "auto" : 0,
            overflow: "hidden",
          }}
        >
          {showLoading ? "Loading…" : ""}
        </p>

        <div aria-live="polite">
          {showEmptyState && (
            <EmptyState
              headline={debouncedQuery ? "No matches" : "No verified projects yet"}
              description={
                debouncedQuery
                  ? `No verified projects match '${debouncedQuery}'.`
                  : "Check back once candidates have published verified work."
              }
            />
          )}
        </div>

        {!error && !initialLoading && displayed.length > 0 && (
          <ul className="mt-6 border-t border-[#D8D3C4]">
            {displayed.map((row) => (
              <ResultRow
                key={row.id}
                project={row}
                included={row.included}
                entering={row.entering}
                reducedMotion={reducedMotion}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
