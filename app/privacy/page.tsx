import Link from "next/link"
import { CheckBadge } from "@/app/components/AppShell"

const TEAM_EMAIL = "Skillproof512@gmail.com"
const LAST_UPDATED = "October 2026"

const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

export const metadata = {
  title: "Privacy Policy · SkillProof",
  description:
    "What SkillProof collects, why we collect it, who can see it, and how to request deletion.",
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
      <h2 className="text-[22px] font-semibold text-[#16231F]" style={serif}>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-[14.5px] leading-7 text-[#16231F]/75">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F6F4EE] text-[#16231F]">
      <header className="border-b border-[#D8D3C4] bg-[#F6F4EE]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 no-underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-4"
          >
            <CheckBadge />
            <span className="text-[20px] font-semibold" style={serif}>
              SkillProof
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/terms"
              className="rounded px-3 py-2 text-[13px] font-medium text-[#16231F]/70 transition-colors hover:text-[#16231F] focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
            >
              Terms
            </Link>
            <Link
              href="/signin"
              className="rounded px-3 py-2 text-[13px] font-medium text-[#16231F]/70 transition-colors hover:text-[#16231F] focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-[#16231F] px-3.5 py-2 text-[13px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#16231F]/45">
          Legal
        </p>
        <h1
          className="mt-3 text-[38px] font-semibold leading-tight tracking-tight sm:text-[46px]"
          style={serif}
        >
          Privacy Policy
        </h1>
        <p className="mt-3 text-[13px] text-[#16231F]/55">
          Last updated: {LAST_UPDATED}
        </p>

        <p className="mt-6 text-[15px] leading-7 text-[#16231F]/75">
          SkillProof stores personal data so we can verify real project work and
          help candidates connect with recruiters. This page explains what we
          collect, why, who can see it, and how to ask us to delete it.
        </p>

        <Section title="What we collect">
          <ul className="list-disc pl-5">
            <li>
              <strong>Account details</strong> — your name, email address, and
              (optionally) a phone number you add at sign-up.
            </li>
            <li>
              <strong>Project information</strong> — project titles,
              descriptions, tech stacks, and evidence you submit (such as
              repository links, live demos, and documentation).
            </li>
            <li>
              <strong>Verification records</strong> — verifier feedback,
              verification results, and the name of the verifier who reviewed
              the project.
            </li>
            <li>
              <strong>Recruiter contact details</strong> — contact information
              a candidate chooses to share with a recruiter after the recruiter
              expresses interest.
            </li>
          </ul>
        </Section>

        <Section title="Why we collect it">
          <ul className="list-disc pl-5">
            <li>
              To create and manage your account and sign you in securely.
            </li>
            <li>
              To let named verifiers review projects and record structured
              feedback.
            </li>
            <li>
              To let recruiters discover verified projects and, when they
              express interest, contact the candidate.
            </li>
            <li>
              To send you transactional emails, such as verification results
              and account confirmation.
            </li>
            <li>
              To keep the platform trustworthy by preventing fake evidence and
              abuse.
            </li>
          </ul>
        </Section>

        <Section title="Who can see what">
          <ul className="list-disc pl-5">
            <li>
              <strong>Verifier names are public.</strong> We show the name of
              the verifier who reviewed a project so candidates and employers
              can see who signed off on the work.
            </li>
            <li>
              <strong>Recruiters only see a candidate&apos;s contact email
              after the recruiter expresses interest.</strong> Before that, the
              candidate&apos;s contact details stay hidden.
            </li>
            <li>
              <strong>Project evidence</strong> (repositories, demos,
              documentation) is visible on the platform as part of the
              candidate&apos;s public profile.
            </li>
            <li>
              <strong>Your account details</strong> (email, phone number) are
              never shown publicly.
            </li>
          </ul>
        </Section>

        <Section title="How to request deletion">
          <p>
            If you want your account and personal data deleted, email us at{" "}
            <a
              href={`mailto:${TEAM_EMAIL}?subject=Data%20deletion%20request`}
              className="font-medium text-[#2F6F52] hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              {TEAM_EMAIL}
            </a>{" "}
            from the address on your account. We&apos;ll confirm the request
            and remove your data within a reasonable timeframe.
          </p>
          <p>
            Some records (for example, a completed verification that is already
            public) may be retained briefly for integrity and audit purposes,
            after which they are removed.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            Anything unclear? Reach the team at{" "}
            <a
              href={`mailto:${TEAM_EMAIL}`}
              className="font-medium text-[#2F6F52] hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              {TEAM_EMAIL}
            </a>
            .
          </p>
        </Section>
      </article>

      <footer className="border-t border-[#D8D3C4] px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-[12px] text-[#16231F]/50 sm:flex-row sm:items-center sm:justify-between">
          <span>SkillProof</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#16231F]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#16231F]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}