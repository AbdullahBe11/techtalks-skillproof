import Link from "next/link"

import { CheckBadge } from "./AppShell"

type EmptyStateProps = {
  headline: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export default function EmptyState({
  headline,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-12 px-6 text-center">
      <CheckBadge
        className="w-8 h-8 mb-1 bg-[#2F6F52]/[0.08] border border-[#2F6F52]/25"
        stroke="#2F6F52"
      />
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
