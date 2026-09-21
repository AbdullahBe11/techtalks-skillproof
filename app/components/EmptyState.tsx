import Link from "next/link"

type EmptyStateProps = {
  headline: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

// Neutral "nothing here" glyph — a circle with a short dash through the
// middle. Shares the badge container styling with the wordmark's checkmark,
// but doesn't borrow its meaning: an empty list isn't a verification state.
function EmptyIcon({
  className = "w-8 h-8 mb-1 bg-[#2F6F52]/[0.08] border border-[#2F6F52]/25",
  stroke = "#2F6F52",
  strokeWidth = 2.5,
}: {
  className?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[60%] w-[60%]"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M8.5 12H15.5" />
      </svg>
    </span>
  )
}

export default function EmptyState({
  headline,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-12 px-6 text-center">
      <EmptyIcon />
      <div
        className="font-medium text-[14.5px] text-[#16231F]"
        style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
      >
        {headline}
      </div>
      <div className="text-[12.5px] text-[#6b6b5f] max-w-[220px] leading-relaxed">
        {description}
      </div>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-1.5 text-[12.5px] text-[#2F6F52] font-medium border-b border-[#6FAE8E] pb-px no-underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
