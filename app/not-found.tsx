import Link from "next/link"

import { CheckBadge } from "@/app/components/AppShell"

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F6F4EE] px-5 text-[#16231F]">
            <div className="w-full max-w-lg text-center">
                <div className="flex justify-center">
                    <CheckBadge className="h-9 w-9 bg-[#2F6F52]" strokeWidth={3} />
                </div>

                <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.14em] text-[#16231F]/45">
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

                <p className="mx-auto mt-3 max-w-md text-[14px] leading-6 text-[#16231F]/60">
                    The page you&apos;re looking for doesn&apos;t exist or may have been
                    moved.
                </p>

                <Link
                    href="/"
                    className="mt-7 inline-flex rounded bg-[#16231F] px-5 py-3 text-[13px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
                >
                    Back to home
                </Link>
            </div>
        </main>
    )
}