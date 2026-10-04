"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"

import { CheckBadge } from "@/app/components/AppShell"

type SessionResponse = {
    user?: {
        name?: string | null
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

    return (
        <header className="bg-[#16231F] text-[#F6F4EE]">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    {showBrowseLink && (
                        <Link
                            href="/projects"
                            className="flex items-center gap-1 text-[13px] text-[#F6F4EE]/75 no-underline hover:text-[#F6F4EE] focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2 focus-visible:rounded-sm"
                        >
                            <span aria-hidden="true">←</span>
                            Browse verified projects
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
                        <span
                            className="max-w-[220px] truncate text-sm text-[#F6F4EE]/90"
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
                            className="rounded border border-[#F6F4EE]/35 px-2.5 py-1.5 text-sm text-[#F6F4EE] hover:bg-[#F6F4EE]/10 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
                        >
                            Sign out
                        </button>
                    </div>
                ) : authenticated ? (
                    <Link
                        href="/signin"
                        className="rounded border border-[#F6F4EE]/35 px-2.5 py-1.5 text-sm text-[#F6F4EE] hover:bg-[#F6F4EE]/10 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
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