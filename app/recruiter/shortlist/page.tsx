import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildShortlistResponse } from "@/lib/shortlist"
import { CheckBadge } from "@/app/components/AppShell"
import EmptyState from "@/app/components/EmptyState"
import RemoveButton from "./RemoveButton"

export default async function ShortlistPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const userId = (session.user as { id?: string }).id
  const userRole = (session.user as { role?: string }).role
  if (!userId || userRole !== "recruiter") redirect("/")

  const entries = await prisma.shortList.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      profile: {
        select: {
          userId: true,
          headline: true,
          user: { select: { name: true } },
          _count: {
            select: {
              projects: {
                where: {
                  verificationStatus: "verified",
                  publishedState: "published",
                },
              },
            },
          },
        },
      },
    },
  })

  const { candidates } = buildShortlistResponse(entries)

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 overflow-x-hidden px-4 py-8">
      <h1
        className="text-[22px] font-semibold text-[#16231F]"
        style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
      >
        My shortlist
      </h1>

      {candidates.length === 0 ? (
        <EmptyState
          headline="No one shortlisted yet"
          description="Candidates you shortlist from their profile will appear here."
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 rounded border border-[#D8D3C4] bg-white/30 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={c.profileUrl}
                  className="break-words text-[15px] font-medium text-[#2F6F52] no-underline hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
                >
                  {c.name}
                </Link>

                {c.headline && (
                  <p className="mt-0.5 break-words text-[13.5px] text-[#16231F]/70">
                    {c.headline}
                  </p>
                )}

                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#2F6F52]/25 bg-[#2F6F52]/[0.08] px-2.5 py-1 text-[12px] font-medium text-[#2F6F52]">
                  <CheckBadge
                    className="h-3.5 w-3.5 bg-[#2F6F52]"
                    strokeWidth={3}
                  />
                  {c.verifiedProjectCount}{" "}
                  {c.verifiedProjectCount === 1
                    ? "verified project"
                    : "verified projects"}
                </div>
              </div>

              <div className="shrink-0">
                <RemoveButton candidateId={c.id} name={c.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}