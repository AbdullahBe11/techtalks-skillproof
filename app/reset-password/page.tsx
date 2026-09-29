"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import AuthCard, { Alert, buttonClass, inputClass, labelClass, linkClass } from "@/app/components/AuthCard"
import { validatePassword } from "@/lib/password"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (password !== confirm) {
      setError("The two passwords don't match.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setDone(true)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthCard title="Reset link missing">
        <Alert kind="error">This page needs the link from your reset email.</Alert>
        <p className="mt-5 text-center text-[13px] text-[#16231F]/60">
          <Link href="/forgot-password" className={linkClass}>
            Request a new reset link
          </Link>
        </p>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <AuthCard title="Password updated">
        <Alert kind="success">Your password has been reset. You can now sign in with your new password.</Alert>
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
      title="Choose a new password"
      subtitle="At least 8 characters, with both letters and numbers."
    >
      {error && <Alert kind="error">{error}</Alert>}
      <form className="mt-4 flex flex-col gap-[13px]" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
        <div>
          <label htmlFor="password" className={labelClass}>
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Saving…" : "Reset password"}
        </button>
      </form>
      {error?.includes("expired") && (
        <p className="mt-5 text-center text-[13px] text-[#16231F]/60">
          <Link href="/forgot-password" className={linkClass}>
            Request a new reset link
          </Link>
        </p>
      )}
    </AuthCard>
  )
}
