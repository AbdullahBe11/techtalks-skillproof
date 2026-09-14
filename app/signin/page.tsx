"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"

type Role = "candidate" | "recruiter" | "verifier"

const ROLE_HOME: Record<Role, string> = {
  candidate: "/candidate/projects",
  recruiter: "/recruiter/browse",
  verifier: "/verifier/queue",
}

type FieldErrors = {
  email?: string
  password?: string
}

// Shared serif treatment — mirrors the inline-style convention used in
// app/components/AppShell.tsx (var(--font-serif) is registered in app/layout.tsx).
const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

// Small circular checkmark badge — reused for the wordmark and the side panel.
function CheckBadge({
  className = "w-5 h-5 bg-[#2F6F52]",
  stroke = "#F6F4EE",
  strokeWidth = 2.5,
}: {
  className?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[60%] w-[60%]"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

// Small spinning ring for the submit button's loading state. Sized to sit
// inline with the button text; inherits the button's text color via
// currentColor-style hardcoding since the button is always on the dark bg.
function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F6F4EE]/35 border-t-[#F6F4EE]"
    />
  )
}

// The dark side panel is only mounted at/above the `sm` breakpoint (640px).
// Below that it is never rendered, keeping the mobile DOM to just the form.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return isDesktop
}

export default function SignInPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!email.trim()) errs.email = "Email is required."
    if (!password) errs.password = "Password is required."
    return errs
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      })

      // Any failure — wrong password, no such user, anything — is reported
      // with the exact same message. Never reveal whether the email exists.
      if (!result || result.error) {
        setFormError("Invalid email or password.")
        setSubmitting(false)
        return
      }

      const session = await getSession()
      const sessionRole = (session?.user as { role?: Role } | undefined)?.role
      router.push(sessionRole ? ROLE_HOME[sessionRole] : "/")
    } catch {
      setFormError("Invalid email or password.")
      setSubmitting(false)
    }
  }

  const inputBase =
    "w-full rounded border bg-[#F6F4EE] px-3 py-2.5 text-[14px] text-[#16231F] outline-none transition-colors placeholder:text-[#16231F]/35 focus:border-[#2F6F52] focus:ring-1 focus:ring-[#2F6F52]"

  function inputClass(hasError: boolean) {
    return `${inputBase} ${hasError ? "border-[#A8452E]" : "border-[#D8D3C4]"}`
  }

  const labelClass = "block text-[13px] font-medium text-[#16231F]/70 mb-1"
  const fieldErrorClass = "mt-1 text-[12.5px] text-[#A8452E]"

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F4EE] px-4 py-10">
      <div
        className={`w-full max-h-[90vh] overflow-hidden rounded-md border border-[#D8D3C4] shadow-sm ${
          isDesktop ? "flex max-w-4xl" : "flex flex-col max-w-[400px]"
        }`}
      >
        {isDesktop && (
          <aside className="flex w-1/2 shrink-0 flex-col justify-between overflow-hidden bg-[#16231F] p-7 text-[#F6F4EE]">
            <div>
              <div className="flex items-center gap-2">
                <CheckBadge />
                <span className="text-[20px] font-semibold" style={serif}>
                  SkillProof
                </span>
              </div>

              <p
                className="mt-6 text-[22px] leading-snug text-[#F6F4EE]"
                style={serif}
              >
                Your work is{" "}
                <span className="text-[#6FAE8E]">already speaking for you</span>.
              </p>
              <p className="mt-3 text-[13px] text-[#F6F4EE]/55">
                Sign back in to pick up where you left off.
              </p>
            </div>

            <div className="mt-5 border-t border-[#F6F4EE]/15 pt-3.5">
              <p
                className="text-[44px] font-semibold text-[#6FAE8E]"
                style={serif}
              >
                100%
              </p>
              <p className="mt-1 text-[13px] text-[#F6F4EE]/70">
                of scores are reviewed by a named, human verifier
              </p>
            </div>
          </aside>
        )}

        <div className="min-h-0 w-full overflow-y-auto bg-[#F6F4EE] p-7 sm:w-1/2">
          <div className="flex items-center justify-center gap-2">
            <CheckBadge />
            <span
              className="text-[20px] font-semibold text-[#16231F]"
              style={serif}
            >
              SkillProof
            </span>
          </div>
          <p className="mt-1 text-center text-[13px] text-[#16231F]/55">
            Verified proof of your real work.
          </p>

          <h1
            className="mt-3.5 text-[18px] font-semibold text-[#16231F]"
            style={serif}
          >
            Sign in
          </h1>

          {formError && (
            <div
              role="alert"
              className="mt-4 rounded border-l-2 border-[#A8452E] bg-[#A8452E]/10 px-3 py-2 text-[13px] text-[#A8452E]"
            >
              {formError}
            </div>
          )}

          <form
            className="mt-3.5 flex flex-col gap-[13px]"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={submitting}
          >
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  clearFieldError("email")
                }}
                className={inputClass(Boolean(fieldErrors.email))}
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className={fieldErrorClass}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearFieldError("password")
                }}
                className={inputClass(Boolean(fieldErrors.password))}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
              />
              {fieldErrors.password && (
                <p id="password-error" className={fieldErrorClass}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded bg-[#16231F] py-3 text-[14px] font-medium text-[#F6F4EE] transition-colors hover:bg-[#16231F]/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#6FAE8E] focus-visible:outline-offset-2"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-[#16231F]/60">
            New to SkillProof?{" "}
            <Link
              href="/signup"
              className="font-medium text-[#2F6F52] hover:underline focus-visible:outline-2 focus-visible:outline-[#2F6F52] focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
