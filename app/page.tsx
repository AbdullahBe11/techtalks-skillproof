import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CheckBadge } from "@/app/components/AppShell"
import ThemeToggle from "@/app/components/ThemeToggle"

const ROLE_HOME: Record<string, string> = {
  candidate: "/candidate/projects",
  verifier: "/verifier/queue",
  recruiter: "/recruiter/browse",
}

export default async function Home() {
  const session = await auth()

  // Keep the existing TS-11 behavior:
  // signed-in users go directly to their role's home page.
  if (session?.user) {
    const role = (session.user as { role?: string }).role

    if (role && ROLE_HOME[role]) {
      redirect(ROLE_HOME[role])
    }

    redirect("/signin")
  }

  // Signed-out visitors see the public landing page.
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-4"
          >
            <CheckBadge />
            <span
              className="text-[20px] font-semibold"
              style={{ fontFamily: "var(--font-serif, Georgia, serif)" }}
            >
              SkillProof
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded px-3 py-2 text-[13px] font-medium text-ink/70 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="rounded bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              Sign up
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-wash/40 px-3 py-1.5 text-[12px] text-ink/65">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Verified proof of real work
            </div>

            <h1
              className="mt-6 max-w-3xl text-[42px] font-semibold leading-[1.05] tracking-tight sm:text-[58px]"
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
              }}
            >
              Show what you can build.
              <span className="block text-brand">
                Not just what your CV says.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-7 text-ink/65 sm:text-[17px]">
              SkillProof helps junior developers and recent graduates showcase
              real completed projects with verified evidence and feedback from
              named reviewers.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded bg-ink px-5 py-3 text-[13px] font-medium text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                Create your account
              </Link>

              <Link
                href="/signin"
                className="rounded border border-line bg-wash/30 px-5 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-wash/60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                Sign in
              </Link>

              <Link
                href="/projects"
                className="px-2 py-3 text-[13px] font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
              >
                Browse verified projects →
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-wash/45 p-5 shadow-sm sm:p-6">
            <div className="border-b border-line pb-4">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/45">
                What employers see
              </p>
              <h2
                className="mt-2 text-[24px] font-semibold"
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                }}
              >
                Proof they can evaluate
              </h2>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div className="rounded border border-line bg-paper p-4">
                <p className="text-[13px] font-medium">Inventory Management App</p>
                <p className="mt-1 text-[12px] text-ink/55">
                  React · Node.js · PostgreSQL
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-brand/25 bg-brand/10 px-2 py-1 text-brand">
                    Verified
                  </span>
                  <span className="rounded-full border border-line px-2 py-1 text-ink/60">
                    Verification passed
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-line bg-paper p-4">
                  <p className="text-[12px] text-ink/50">
                    Real project
                  </p>
                  <p className="mt-1 text-[13px] font-medium">
                    GitHub + live demo
                  </p>
                </div>

                <div className="rounded border border-line bg-paper p-4">
                  <p className="text-[12px] text-ink/50">
                    Human review
                  </p>
                  <p className="mt-1 text-[13px] font-medium">
                    Named verifier feedback
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-wash/25">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">
          <div className="max-w-2xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/45">
              How it works
            </p>
            <h2
              className="mt-2 text-[30px] font-semibold"
              style={{
                fontFamily: "var(--font-serif, Georgia, serif)",
              }}
            >
              From completed work to credible proof
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded border border-line bg-paper p-5">
              <span className="text-[12px] font-medium text-brand">
                01
              </span>
              <h3
                className="mt-3 text-[18px] font-semibold"
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                }}
              >
                Add real projects
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-ink/60">
                Share completed work, your tech stack, and evidence such as
                repositories, demos, and documentation.
              </p>
            </div>

            <div className="rounded border border-line bg-paper p-5">
              <span className="text-[12px] font-medium text-brand">
                02
              </span>
              <h3
                className="mt-3 text-[18px] font-semibold"
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                }}
              >
                Get verified
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-ink/60">
                A named verifier reviews the actual work and records structured
                feedback and a clear verification result.
              </p>
            </div>

            <div className="rounded border border-line bg-paper p-5">
              <span className="text-[12px] font-medium text-brand">
                03
              </span>
              <h3
                className="mt-3 text-[18px] font-semibold"
                style={{
                  fontFamily: "var(--font-serif, Georgia, serif)",
                }}
              >
                Connect with employers
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-ink/60">
                Recruiters can discover verified projects and decide who they
                want to connect with.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">
        <div className="chrome rounded-lg bg-ink px-6 py-10 text-paper sm:px-10">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-brand-light">
            Built for the Lebanese tech ecosystem
          </p>

          <h2
            className="mt-3 max-w-2xl text-[30px] font-semibold sm:text-[36px]"
            style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
            }}
          >
            Give employers something stronger than a list of claims.
          </h2>

          <p className="mt-4 max-w-2xl text-[14px] leading-6 text-paper/60">
            SkillProof turns completed project work into evidence that is
            easier for candidates to present and easier for employers to
            evaluate.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded bg-paper px-5 py-3 text-[13px] font-medium text-ink transition-colors hover:bg-wash focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
            >
              Get started
            </Link>
        
            <Link
              href="/signin"
              className="rounded border border-paper/25 px-5 py-3 text-[13px] font-medium text-paper transition-colors hover:bg-paper/10 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-[12px] text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span>SkillProof</span>
            <span className="hidden sm:inline">·</span>
            <span>Verified proof of real work.</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="rounded hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="rounded hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}