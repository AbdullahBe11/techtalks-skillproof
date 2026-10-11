import Link from "next/link"
import { CheckBadge } from "@/app/components/AppShell"

const TEAM_EMAIL = "Skillproof512@gmail.com"
const LAST_UPDATED = "October 2026"

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

export const metadata = {
  title: "Terms of Service · SkillProof",
  description:
    "The basic rules for using SkillProof: no fake evidence, verifiers must be independent, and accounts that break the rules can be removed.",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <h2 className="text-[22px] font-semibold text-ink" style={serif}>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[14.5px] leading-7 text-ink/75">
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-4"
          >
            <CheckBadge />
            <span className="text-[20px] font-semibold" style={serif}>
              SkillProof
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="rounded px-3 py-2 text-[13px] font-medium text-ink/70 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
            >
              Privacy
            </Link>
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
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink/45">
          Legal
        </p>
        <h1
          className="mt-3 text-[38px] font-semibold leading-tight tracking-tight sm:text-[46px]"
          style={serif}
        >
          Terms of Service
        </h1>
        <p className="mt-3 text-[13px] text-ink/55">
          Last updated: {LAST_UPDATED}
        </p>

        <p className="mt-6 text-[15px] leading-7 text-ink/75">
          These are the basic rules for using SkillProof. By creating an
          account or using the platform, you agree to them.
        </p>

        <Section title="No fake evidence">
          <p>
            Everything you submit must be real work that you actually built or
            meaningfully contributed to. Do not upload fake projects,
            fabricated evidence, or work that belongs to someone else.
          </p>
          <p>
            If we find fake evidence, we may remove the project, remove the
            verification, and suspend or delete the account.
          </p>
        </Section>

        <Section title="Verifiers must be independent">
          <p>
            Verifiers must not review their own projects or projects they have
            a personal or financial stake in. If you are not able to give an
            independent review, do not accept the project.
          </p>
          <p>
            Verifier names are shown publicly alongside the projects they
            review, so your decisions are attached to you.
          </p>
        </Section>

        <Section title="We can remove accounts that break the rules">
          <p>
            We may suspend or remove any account that violates these terms,
            including accounts that submit fake evidence, abuse the
            verification process, or harass other users.
          </p>
          <p>
            When we can, we&apos;ll explain what happened and give you a chance
            to respond.
          </p>
        </Section>

        <Section title="Your responsibilities">
          <ul className="list-disc pl-5">
            <li>Keep your account credentials secure.</li>
            <li>
              Only share personal data that you are comfortable being stored
              and, where applicable, shown on the platform.
            </li>
            <li>
              Do not attempt to bypass verification or misrepresent your work.
            </li>
          </ul>
        </Section>

        <Section title="Changes to these terms">
          <p>
            We may update these terms as the platform evolves. If we make a
            meaningful change, we&apos;ll update the &ldquo;Last updated&rdquo;
            date above and, where appropriate, notify you.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            Reach the team at{" "}
            <a
              href={`mailto:${TEAM_EMAIL}`}
              className="font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              {TEAM_EMAIL}
            </a>
            .
          </p>
        </Section>
      </article>

      <footer className="border-t border-line px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[12px] text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <span>SkillProof</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}