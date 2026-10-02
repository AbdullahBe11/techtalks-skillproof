"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import AuthCard, {
  Alert,
  buttonClass,
  inputClass,
  labelClass,
  linkClass,
} from "@/app/components/AuthCard"

type PageState = "checking" | "success" | "error"

const GENERIC_RESEND_MESSAGE =
  "If that email belongs to an unverified account, a confirmation link has been sent."

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [pageState, setPageState] =
    useState<PageState>(token ? "checking" : "error")

  const [error, setError] = useState<string | null>(
    token
      ? null
      : "This page needs the link from your verification email."
  )

  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] =
    useState<string | null>(null)

  const verificationStarted = useRef(false)

  useEffect(() => {
    if (!token || verificationStarted.current) {
      return
    }

    verificationStarted.current = true

    async function verifyEmail() {
      try {
        const res = await fetch(
          "/api/email-verification/confirm",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        )

        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setError(
            (data as { error?: string }).error ??
              "This verification link is invalid or has expired."
          )
          setPageState("error")
          return
        }

        setPageState("success")
      } catch {
        setError(
          "Couldn't reach the server. Please try again."
        )
        setPageState("error")
      }
    }

    verifyEmail()
  }, [token])

  async function handleResend(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()
    setResendMessage(null)
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }

    setResending(true)

    try {
      const res = await fetch(
        "/api/email-verification/resend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          (data as { error?: string }).error ??
            "Something went wrong. Please try again."
        )
        return
      }

      setResendMessage(
        (data as { message?: string }).message ??
          GENERIC_RESEND_MESSAGE
      )
    } catch {
      setError(
        "Couldn't reach the server. Check your connection and try again."
      )
    } finally {
      setResending(false)
    }
  }

  if (pageState === "checking") {
    return (
      <AuthCard
        title="Confirming your email"
        subtitle="Please wait while we verify your confirmation link."
      >
        <div className="mt-5 h-1 w-full overflow-hidden rounded bg-[#D8D3C4]">
          <div className="h-full w-1/2 animate-pulse rounded bg-[#2F6F52]" />
        </div>
      </AuthCard>
    )
  }

  if (pageState === "success") {
    return (
      <AuthCard
        title="Email confirmed"
        subtitle="Your email address has been verified."
      >
        <Alert kind="success">
          Email confirmed — you can sign in now
        </Alert>

        <Link
          href="/signin"
          className={`${buttonClass} mt-5 block text-center`}
        >
          Go to sign in
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Email confirmation needed"
      subtitle="This verification link is invalid or has expired."
    >
      {error && <Alert kind="error">{error}</Alert>}

      <p className="mt-3 text-[13px] leading-relaxed text-[#16231F]/60">
        Enter your email below and we&apos;ll send you a fresh
        confirmation link.
      </p>

      {resendMessage && (
        <Alert kind="success">{resendMessage}</Alert>
      )}

      <form
        className="mt-4 flex flex-col gap-[13px]"
        onSubmit={handleResend}
        noValidate
        aria-busy={resending}
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
              setError(null)
              setResendMessage(null)
            }}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={resending}
          className={buttonClass}
        >
          {resending
            ? "Sending…"
            : "Resend confirmation email"}
        </button>
      </form>

      <p className="mt-5 text-center text-[13px] text-[#16231F]/60">
        <Link href="/signin" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}