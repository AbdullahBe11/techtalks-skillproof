"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import ThemeToggle from "@/app/components/ThemeToggle"

type NavLink = {
  label: string
  href: string
}

// Small circular checkmark badge — shared with the sign-in/sign-up wordmark
// and side panels, and the EmptyState component, so the SVG isn't duplicated.
export function CheckBadge({
  className = "w-5 h-5 bg-brand",
  stroke = "#F6F4EE",
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

const ROLE_NAV_LINKS: Record<string, NavLink[]> = {
  candidate: [
    { label: "My projects", href: "/candidate/projects" },
    { label: "My profile", href: "/candidate/profile" },
    { label: "Interested recruiters", href: "/candidate/interests" },
  ],
  recruiter: [
  { label: "Browse candidates", href: "/recruiter/browse" },
  { label: "My shortlist", href: "/recruiter/shortlist" },
],
  verifier: [{ label: "Review queue", href: "/verifier/queue" }],
}

const ROLE_LABELS: Record<string, string> = {
  candidate: "Candidate",
  recruiter: "Recruiter",
  verifier: "Verifier",
}

type AppShellProps = {
  role: string
  userName?: string | null
  children: React.ReactNode
}

export default function AppShell({ role, userName, children }: AppShellProps) {
  const pathname = usePathname()
  const links = ROLE_NAV_LINKS[role] ?? []
  const roleLabel = ROLE_LABELS[role] ?? role

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <header className="chrome bg-ink text-paper">
        {/* Mobile: logo + sign out on the first row, nav on its own
            scrollable row below. From sm up: one row, nav next to the logo. */}
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
            <span
              className="order-1 shrink-0 text-lg font-semibold"
              style={{ fontFamily: "var(--font-serif, serif)" }}
            >
              SkillProof
            </span>

            <nav className="order-3 -mx-4 flex w-[calc(100%+2rem)] gap-5 overflow-x-auto whitespace-nowrap px-4 sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:px-0">
              {links.map((link) => {
                const active = pathname?.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`shrink-0 text-sm pb-0.5 border-b focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2 focus-visible:rounded-sm ${
                      active
                        ? "border-brand text-paper"
                        : "border-transparent text-paper/70 hover:text-paper"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

          <div className="order-2 flex shrink-0 items-center gap-3 sm:order-3">
            {/* Role label: plain paper-white text. Green is reserved for
                "active/verified" state only (see the nav underline above),
                so it isn't reused here just for identity. */}
            <span
              className="hidden text-sm text-paper/85 sm:inline"
              style={{ fontFamily: "var(--font-serif, serif)" }}
            >
              {userName ? `${userName} · ` : ""}
              {roleLabel}
            </span>

            {/* Sign-out as a small outlined button, not underlined text —
                gives it its own visual weight so it doesn't blend with the
                faded inactive nav links next to it. */}
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs border border-paper/35 rounded px-2.5 py-1.5 text-paper hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
