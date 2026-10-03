"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"

import EmptyState from "@/app/components/EmptyState"
import { CheckBadge } from "@/app/components/AppShell"
import { SkillChips } from "@/app/components/SkillTags"

type CandidateProjectSummary = {
  id: string
  title: string
  description: string | null
  skills: string[]
  createdAt: string
}

type Candidate = {
  id: string
  name: string
  headline?: string | null
  bio: string | null
  cvUrl: string | null
  projects: CandidateProjectSummary[]
}

type DisplayCandidate = Candidate & {
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

// The API returns skills per project, not one flattened list per candidate —
// dedupe across all of a candidate's projects, keeping first-seen order.
function uniqueCandidateSkills(candidate: Candidate): string[] {
  const seen = new Set<string>()
  const skills: string[] = []
  for (const project of candidate.projects) {
    for (const skill of project.skills) {
      if (seen.has(skill)) continue
      seen.add(skill)
      skills.push(skill)
    }
  }
  return skills
}

// A single result row. Its own height/opacity animates in and out via the
// CSS Grid `grid-template-rows: 1fr` / `0fr` technique so it collapses in
// place instead of the list jump-cutting on every keystroke.
function CandidateRow({
  candidate,
  included,
  entering,
  reducedMotion,
  onSelectSkill,
}: {
  candidate: Candidate
  included: boolean
  entering: boolean
  reducedMotion: boolean
  onSelectSkill: (skill: string) => void
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

  const verifiedCount = candidate.projects.length
  const skills = uniqueCandidateSkills(candidate)

  return (
    <li
      className="recruiter-candidate-row border-b border-[#D8D3C4]"
      style={{
        display: "grid",
        gridTemplateRows: expanded ? "1fr" : "0fr",
        opacity: expanded ? 1 : 0,
        transition: `grid-template-rows ${duration}ms ${easing}, opacity ${duration}ms ${easing}`,
      }}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="flex flex-col gap-1.5 py-3.5">
          <Link
            href={`/candidates/${candidate.id}`}
            className="w-fit break-words text-[14.5px] font-medium text-[#16231F] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
            style={serif}
          >
            {candidate.name}
          </Link>
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#2F6F52]/25 bg-[#2F6F52]/[0.08] px-2.5 py-1 text-[12px] font-medium text-[#2F6F52]">
            <CheckBadge className="h-3.5 w-3.5 bg-[#2F6F52]" strokeWidth={3} />
            {verifiedCount}{" "}
            {verifiedCount === 1 ? "verified project" : "verified projects"}
          </div>
          {candidate.headline && (
            <p className="break-words text-[13px] font-medium text-[#16231F]/75">
              {candidate.headline}
            </p>
          )}
          {candidate.bio && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-[#16231F]/60">
              {candidate.bio}
            </p>
          )}
          {skills.length > 0 && (
            <div className="mt-1">
              <SkillChips skills={skills} onSelect={onSelectSkill} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default function RecruiterCandidatesPage() {
  const reducedMotion = useReducedMotion()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [activeChipFilter, setActiveChipFilter] = useState<string | null>(
    null
  )
  const [results, setResults] = useState<Candidate[] | null>(null)
  const [displayed, setDisplayed] = useState<DisplayCandidate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)

  const requestIdRef = useRef(0)
  const hasLoadedOnceRef = useRef(false)

  // Debounce the raw input ~300ms before it drives the API query.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Fetch from the real recruiter API on each debounced query change.
  useEffect(() => {
    let cancelled = false
    const requestId = ++requestIdRef.current

    async function load() {
      try {
        const url = debouncedQuery
          ? `/api/recruiter/candidates?keyword=${encodeURIComponent(debouncedQuery)}`
          : "/api/recruiter/candidates"
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
        setResults(data as Candidate[])
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
  // genuinely new rows animate in — except on the very first load.
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

  function handleSelectSkill(skill: string) {
    setQuery(skill)
    setActiveChipFilter(skill)
  }

  function handleClearFilter() {
    setQuery("")
    setActiveChipFilter(null)
  }

  const matchCount = results?.length ?? 0
  const countText =
    matchCount === 1
      ? `1 candidate matches '${debouncedQuery}'`
      : `${matchCount} candidates match '${debouncedQuery}'`
  const { shown: countShown, opacity: countOpacity } = useCrossfadeText(
    countText,
    150,
    reducedMotion
  )

  const showEmptyState =
    !error &&
    !initialLoading &&
    results !== null &&
    results.length === 0 &&
    displayed.length === 0
  const showCount = !error && debouncedQuery.length > 0 && !initialLoading
  const showLoading = !error && initialLoading

  return (
    <main>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .recruiter-candidate-row:hover {
            background-color: rgba(22, 35, 31, 0.03);
          }
        }
      `}</style>

      <h1 className="text-[20px] font-semibold text-[#16231F]" style={serif}>
        Browse candidates
      </h1>
      <p className="mt-1 text-[13px] text-[#16231F]/55">
        Verified candidates across SkillProof, searchable by name, title, project keyword
        or skill.
      </p>

      <div className="relative mt-5 max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#16231F]/40">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveChipFilter(null)
          }}
          placeholder="Search by name, title, keyword or skill…"
          aria-label="Search verified candidates"
          className="w-full rounded border border-[#D8D3C4] bg-[#F6F4EE] py-2.5 pl-9 pr-3 text-[14px] text-[#16231F] outline-none transition-colors placeholder:text-[#16231F]/35 focus:border-[#2F6F52] focus:ring-1 focus:ring-[#2F6F52]"
        />
      </div>

      {activeChipFilter && (
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#2F6F52]/25 bg-[#2F6F52]/8 py-0.5 pl-2.5 pr-1 text-[12px] text-[#2F6F52]">
            {activeChipFilter}
            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-full px-1 leading-none text-[#2F6F52]/70 hover:text-[#A8452E] focus-visible:outline-2 focus-visible:outline-[#2F6F52]"
              aria-label={`Clear ${activeChipFilter} filter`}
            >
              ×
            </button>
          </span>
        </div>
      )}

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
            headline={debouncedQuery ? "No matches" : "No verified candidates yet"}
            description={
              debouncedQuery
                ? `No verified candidates match '${debouncedQuery}'.`
                : "Check back once candidates have published verified work."
            }
          />
        )}
      </div>

      {!error && !initialLoading && displayed.length > 0 && (
        <ul className="mt-6 border-t border-[#D8D3C4]">
          {displayed.map((row) => (
            <CandidateRow
              key={row.id}
              candidate={row}
              included={row.included}
              entering={row.entering}
              reducedMotion={reducedMotion}
              onSelectSkill={handleSelectSkill}
            />
          ))}
        </ul>
      )}
    </main>
  )
}
