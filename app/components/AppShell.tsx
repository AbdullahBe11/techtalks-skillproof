"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

type NavLink = {
  label: string
  href: string
}

const ROLE_NAV_LINKS: Record<string, NavLink[]> = {
  candidate: [{ label: "My projects", href: "/candidate/projects" }],
  recruiter: [{ label: "Browse candidates", href: "/recruiter/browse" }],
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
                    className={`text-sm pb-0.5 border-b ${
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
              onClick={() => signOut()}
              className="text-xs border border-[#F6F4EE]/35 rounded px-2.5 py-1.5 text-[#F6F4EE] hover:bg-[#F6F4EE]/10"
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
