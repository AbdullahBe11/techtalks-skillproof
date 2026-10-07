import { SCORE_MAX, type ScoreSummary } from "@/lib/rubric"

// Compact display of a project's rubric scores (TS-49).
// Used on the public candidate profile and the candidate's own project page.
export default function RubricScores({
  scores,
  className = "",
}: {
  scores: ScoreSummary | null | undefined
  className?: string
}) {
  if (!scores) return null

  return (
    <div className={className}>
      <p className="text-[12px] font-medium text-[#16231F]/70">
        Rubric score: {scores.average.toFixed(1)} / {SCORE_MAX}
      </p>
      <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Rubric scores">
        {scores.criteria.map((c) => (
          <li
            key={c.id}
            className="rounded-full border border-[#D8D3C4] px-2 py-0.5 text-[11.5px] text-[#16231F]/65"
          >
            {c.name} {c.score}/{SCORE_MAX}
          </li>
        ))}
      </ul>
    </div>
  )
}
