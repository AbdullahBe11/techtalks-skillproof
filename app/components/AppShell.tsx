"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

type NavLink = {
  label: string
  href: string
}

// Small circular checkmark badge — shared with the sign-in/sign-up wordmark
// and side panels, and the EmptyState component, so the SVG isn't duplicated.
export function CheckBadge({
  className = "w-5 h-5 bg-[#2F6F52]",
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
    <div className="min-h-screen flex flex-col bg-[#F6F4EE] text-[#16231F]">
      <header className="bg-[#16231F] text-[#F6F4EE]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start sm:gap-8">
            <span
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-serif, serif)" }}
            >
              SkillProof
            </span>

            <nav className="flex gap-5">
              {links.map((link) => {
                const active = pathname?.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm pb-0.5 border-b focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2 focus-visible:rounded-sm ${
                      active
                        ? "border-[#2F6F52] text-[#F6F4EE]"
                        : "border-transparent text-[#F6F4EE]/70 hover:text-[#F6F4EE]"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            {/* Role label: plain paper-white text. Green is reserved for
                "active/verified" state only (see the nav underline above),
                so it isn't reused here just for identity. */}
            <span
              className="text-sm text-[#F6F4EE]/85"
              style={{ fontFamily: "var(--font-serif, serif)" }}
            >
              {userName ? `${userName} · ` : ""}
              {roleLabel}
            </span>

            {/* Sign-out as a small outlined button, not underlined text —
                gives it its own visual weight so it doesn't blend with the
                faded inactive nav links next to it. */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs border border-[#F6F4EE]/35 rounded px-2.5 py-1.5 text-[#F6F4EE] hover:bg-[#F6F4EE]/10 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
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
