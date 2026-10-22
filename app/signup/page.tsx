"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Role = "candidate" | "recruiter"

// TODO: replace with the team's real contact address
const VERIFIER_ACCESS_EMAIL = "Skillproof512@gmail.com"

// Where each role lands after they're signed in. The client can't read the
// role back from signIn()'s return value, so after a successful sign-in we
// pull the session and use session.user.role to pick the destination.
const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  {
    value: "candidate",
    label: "Candidate",
    description: "Show off your real work and have it independently verified.",
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Search for candidates and review proof of what they've built.",
  },
]

type FieldErrors = {
  name?: string
  email?: string
  password?: string
  role?: string
}

// Shared serif treatment — mirrors the inline-style convention used in
// app/components/AppShell.tsx (var(--font-serif) is registered in app/layout.tsx).
const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

// Small circular checkmark badge — reused for the wordmark, the selected role
// card, and the rubric bullets in the side panel.
function CheckBadge({
  className = "w-5 h-5 bg-brand",
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
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/35 border-t-paper"
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

// Cosmetic only — a client-side hint about password strength. It never blocks
// submission and never overrides the real 8-character validation error.
function passwordStrength(value: string) {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) score++
  if (/[^a-zA-Z0-9]/.test(value)) score++
  return score
}

export default function SignUpPage() {
  const isDesktop = useIsDesktop()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [role, setRole] = useState<Role | "">("")

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  // True only for the 409 "email already exists" case, which also renders a
  // "Try signing in instead." link under the email field (see the mockup).
  const [emailTaken, setEmailTaken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
    if (field === "email") setEmailTaken(false)
  }

  // Client-side checks mirror the server's 400 wording so the message doesn't
  // change if the same problem comes back from /api/register.
  function validate(): FieldErrors {
    const errs: FieldErrors = {}
    if (!name.trim()) errs.name = "Name is required."
    if (!email.trim()) errs.email = "Email is required."
    if (!password) errs.password = "Password is required."
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters."
    if (!role) errs.role = "Choose the option that best describes you."
    return errs
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setEmailTaken(false)

    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
          role,
        }),
      })

if (res.status === 201) {
  setVerificationEmail(email.trim())
  setVerificationSent(true)
  return
}

      const data = (await res.json().catch(() => ({}))) as { error?: string }
      const message = data.error ?? "Something went wrong. Please try again."

      // 409 = email already registered. Route it under the email field with a
      // link to sign in. Note the 400 "…are all required." message also contains
      // the word "email", so match on the status code, not the text.
      if (res.status === 409) {
        setFieldErrors({ email: message })
        setEmailTaken(true)
      } else {
        setFormError(message)
      }
    } catch {
      setFormError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase =
    "w-full rounded border bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand focus:ring-1 focus:ring-brand"

  function inputClass(hasError: boolean) {
    return `${inputBase} ${hasError ? "border-danger" : "border-line"}`
  }

  const labelClass = "block text-[13px] font-medium text-ink/70 mb-1"
  const fieldErrorClass = "mt-1 text-[12.5px] text-danger"

  // Cosmetic password-strength meter — derived from the current value on every
  // render, so it updates live as the user types. Does not affect validation.
  const pwScore = passwordStrength(password)
  let pwFill = 0
  let pwBarClass = ""
  let pwLabel = "Type a password to see its strength"
  let pwLabelClass = "text-ink/55"
  if (password.length > 0) {
    if (pwScore <= 1) {
      pwFill = 1
      pwBarClass = "bg-danger"
      pwLabel = "Weak — try adding numbers or a symbol"
      pwLabelClass = "text-danger"
    } else if (pwScore === 2) {
      pwFill = 2
      pwBarClass = "bg-warn"
      pwLabel = "Okay — a bit longer would help"
      pwLabelClass = "text-warn"
    } else {
      pwFill = 3
      pwBarClass = "bg-brand"
      pwLabel = "Strong"
      pwLabelClass = "text-brand"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div
        className={`w-full max-h-[90vh] overflow-hidden rounded-md border border-line shadow-sm ${
          isDesktop ? "flex max-w-4xl" : "flex flex-col max-w-[400px]"
        }`}
      >
        {isDesktop && (
          <aside className="chrome flex w-1/2 shrink-0 flex-col justify-between overflow-hidden bg-ink p-7 text-paper">
            <div>
              <div className="flex items-center gap-2">
                <CheckBadge />
                <span className="text-[20px] font-semibold" style={serif}>
                  SkillProof
                </span>
              </div>

              <blockquote
                className="mt-6 text-[22px] leading-snug text-paper"
                style={serif}
              >
                &ldquo;A one-page resume doesn&rsquo;t prove{" "}
                <span className="text-brand-light">
                  what I can actually build
                </span>
                .&rdquo;
              </blockquote>
              <p className="mt-3 text-[13px] text-paper/55">
                — from early candidate research
              </p>
            </div>

            <div className="mt-5 border-t border-paper/15 pt-3.5">
              <p className="text-xs tracking-wide text-paper/50">
                EVERY PROJECT IS SCORED ON
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {["Functionality", "Code quality", "Documentation", "Ownership"].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[14px] text-paper/90"
                  >
                    <CheckBadge
                      className="w-4 h-4 bg-brand-light/15"
                      stroke="#6FAE8E"
                      strokeWidth={3}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        <div className="min-h-0 w-full overflow-y-auto bg-paper p-7 sm:w-1/2">
          <div className="flex items-center justify-center gap-2">
            <CheckBadge />
            <span
              className="text-[20px] font-semibold text-ink"
              style={serif}
            >
              SkillProof
            </span>
          </div>
          <p className="mt-1 text-center text-[13px] text-ink/55">
            Verified proof of your real work.
          </p>
        <div className={verificationSent ? "hidden" : ""}>
          <h1
            className="mt-3.5 text-[18px] font-semibold text-ink"
            style={serif}
          >
            Create your account
          </h1>

          {formError && (
            <div
              role="alert"
              className="mt-4 rounded border-l-2 border-danger bg-danger/10 px-3 py-2 text-[13px] text-danger"
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
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  clearFieldError("name")
                }}
                className={inputClass(Boolean(fieldErrors.name))}
                aria-invalid={fieldErrors.name ? true : undefined}
                aria-describedby={fieldErrors.name ? "name-error" : undefined}
              />
              {fieldErrors.name && (
                <p id="name-error" className={fieldErrorClass}>
                  {fieldErrors.name}
                </p>
              )}
            </div>

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
                  {emailTaken && (
                    <>
                      {" "}
                      <Link
                        href="/signin"
                        className="font-medium underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
                      >
                        Try signing in instead.
                      </Link>
                    </>
                  )}
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearFieldError("password")
                }}
                className={inputClass(Boolean(fieldErrors.password))}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={
                  fieldErrors.password
                    ? "password-error password-hint"
                    : "password-hint"
                }
              />
              {fieldErrors.password && (
                <p id="password-error" className={fieldErrorClass}>
                  {fieldErrors.password}
                </p>
              )}
              <p
                id="password-hint"
                className="mt-1 text-[12.5px] text-ink/55"
              >
                At least 8 characters.
              </p>

              <div className="mt-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < pwFill ? pwBarClass : "bg-line"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`mt-1 text-[12px] ${pwLabelClass}`}
                  aria-live="polite"
                >
                  {pwLabel}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className={labelClass}>
                Phone number{" "}
                <span className="font-normal text-ink/45">(optional)</span>
              </label>
              <input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputClass(false)}
              />
            </div>

            <fieldset>
              <legend className={labelClass}>I am a…</legend>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const selected = role === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={`relative flex cursor-pointer items-start gap-2.5 rounded border px-3 py-2.5 transition-colors focus-within:ring-1 focus-within:ring-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand has-[:focus-visible]:outline-offset-2 ${
                        selected
                          ? "border-brand bg-brand/5"
                          : "border-line hover:border-brand-light"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={selected}
                        onChange={() => {
                          setRole(opt.value)
                          clearFieldError("role")
                        }}
                        className="sr-only"
                        aria-describedby={`role-${opt.value}-desc`}
                      />
                      <span
                        className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-brand" : "border-line"
                        }`}
                      >
                        {selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        )}
                      </span>
                      <span className="flex flex-col">
                        <span
                          className="text-[14.5px] font-medium text-ink"
                          style={serif}
                        >
                          {opt.label}
                        </span>
                        <span
                          id={`role-${opt.value}-desc`}
                          className="text-[12.5px] text-ink/60"
                        >
                          {opt.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
              {fieldErrors.role && (
                <p className={fieldErrorClass}>{fieldErrors.role}</p>
              )}
            </fieldset>
                        <p className="text-[12.5px] text-ink/60">
              Want to verify projects? Email us at{" "}
              <a
                href={`mailto:${VERIFIER_ACCESS_EMAIL}`}
                className="font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                {VERIFIER_ACCESS_EMAIL}
              </a>
              .
            </p>

                        <p className="text-[12.5px] leading-5 text-ink/60">
              By signing up you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded bg-ink py-3 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-ink/60">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"
            >
              Sign in
            </Link>
          </p>
          </div>

{verificationSent && (
  <div className="mt-6">
    <h1
      className="text-[18px] font-semibold text-ink"
      style={serif}
    >
      Check your inbox to confirm your email
    </h1>

    <p className="mt-3 text-[13px] leading-relaxed text-ink/70">
      We sent a confirmation link to{" "}
      <span className="font-medium text-ink">
        {verificationEmail}
      </span>
      .
    </p>

    <p className="mt-2 text-[13px] leading-relaxed text-ink/70">
      Open the link to activate your account. The link expires in 24 hours.
    </p>

    <p className="mt-4 text-[12.5px] leading-relaxed text-ink/55">
      Didn&apos;t get it? Check your spam folder. After you try signing in,
      you can request another confirmation email.
    </p>

    <Link
      href="/signin"
      className="mt-6 block w-full rounded bg-ink py-3 text-center text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
    >
      Go to sign in
    </Link>
  </div>
)}
        </div>
      </div>
    </div>
  )
}
