import Link from "next/link"

import { CheckBadge } from "@/app/components/AppShell"

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
            <div className="w-full max-w-lg text-center">
                <div className="flex justify-center">
                    <CheckBadge className="h-9 w-9 bg-brand" strokeWidth={3} />
                </div>

                <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.14em] text-ink/45">
                    404
                </p>

                <h1
                    className="mt-2 text-[34px] font-semibold"
                    style={{
                        fontFamily: "var(--font-serif, Georgia, serif)",
                    }}
                >
                    Page not found
                </h1>

                <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-ink/60">
                    The page you&apos;re looking for doesn&apos;t exist or may have been
                    moved.
                </p>

                <Link
                    href="/"
                    className="mt-7 inline-flex rounded bg-ink px-5 py-3 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
                >
                    Back to home
                </Link>
            </div>
        </main>
    )
}