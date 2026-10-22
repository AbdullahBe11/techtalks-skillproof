"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"

import { CheckBadge } from "@/app/components/AppShell"
import { backLinkForRole } from "@/lib/back-link"
import ThemeToggle from "@/app/components/ThemeToggle"

type SessionResponse = {
    user?: {
        name?: string | null
        role?: string | null
    } | null
}

type PublicHeaderProps = {
    showBrowseLink?: boolean
}

export default function PublicHeader({
    showBrowseLink = false,
}: PublicHeaderProps) {
    const [userName, setUserName] = useState<string | null | undefined>(
        undefined
    )
    const [userRole, setUserRole] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function loadSession() {
            try {
                const res = await fetch("/api/auth/session", {
                    cache: "no-store",
                })

                if (!res.ok) {
                    if (!cancelled) setUserName(null)
                    return
                }

                const data = (await res.json()) as SessionResponse

                if (!cancelled) {
                    setUserName(data.user?.name ?? null)
                    setUserRole(data.user?.role ?? null)
                }
            } catch {
                if (!cancelled) {
                    setUserName(null)
                }
            }
        }

        loadSession()

        return () => {
            cancelled = true
        }
    }, [])

    const authenticated = userName !== undefined
    const backLink = backLinkForRole(userRole)

    return (
        <header className="chrome bg-ink text-paper">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {/* Wait for the session so the link never flashes the wrong destination */}
                    {showBrowseLink && authenticated && (
                        <Link
                            href={backLink.href}
                            className="flex items-center gap-1 text-[13px] text-paper/75 no-underline hover:text-paper focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2 focus-visible:rounded-sm"
                        >
                            <span aria-hidden="true">←</span>
                            {backLink.label}
                        </Link>
                    )}

                    {authenticated && userRole === "recruiter" && (
                    <Link
                        href="/recruiter/shortlist"
                        className="flex items-center gap-1 text-[13px] text-paper/75 no-underline hover:text-paper focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2 focus-visible:rounded-sm"
                    >
                        My shortlist
                    </Link>
                )}

                    <div className="flex items-center gap-2">
                        <CheckBadge />
                        <span
                            className="text-lg font-semibold"
                            style={{
                                fontFamily: "var(--font-serif, Georgia, serif)",
                            }}
                        >
                            SkillProof
                        </span>
                    </div>
                </div>

                {authenticated && userName ? (
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <span
                            className="max-w-[220px] truncate text-sm text-paper/90"
                            title={userName}
                        >
                            {userName}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                signOut({
                                    callbackUrl: "/",
                                })
                            }
                            className="rounded border border-paper/35 px-2.5 py-1.5 text-sm text-paper hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
                        >
                            Sign out
                        </button>
                    </div>
                ) : authenticated ? (
                    <Link
                        href="/signin"
                        className="rounded border border-paper/35 px-2.5 py-1.5 text-sm text-paper hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
                    >
                        Sign in
                    </Link>
                ) : (
                    <span aria-hidden="true" className="h-8 w-16" />
                )}
            </div>
        </header>
    )
}