import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { buildShortlistResponse } from "@/lib/shortlist"

export default async function ShortlistPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  const userId = (session.user as { id?: string }).id
  const userRole = (session.user as { role?: string }).role

  if (!userId || userRole !== "recruiter") {
    redirect("/")
  }

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
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-[22px] font-semibold">My shortlist</h1>

      {candidates.length === 0 ? (
        <p className="text-[14px] text-gray-600">
          You haven&apos;t shortlisted anyone yet.{" "}
          <Link href="/recruiter/browse" className="text-[#2F6F52] underline">
            Browse candidates
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {candidates.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-gray-200 p-4"
            >
              <Link
                href={c.profileUrl}
                className="font-medium text-[#2F6F52] no-underline hover:underline"
              >
                {c.name ?? "Unnamed candidate"}
              </Link>
              {c.headline && (
                <p className="mt-1 text-[13px] text-gray-600">{c.headline}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}