"use client"

import { useState } from "react"
import Link from "next/link"
import AuthCard, { Alert, buttonClass, inputClass, labelClass, linkClass } from "@/app/components/AuthCard"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentMessage, setSentMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError("Please enter your email.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setSentMessage(data.message)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new one."
    >
      {sentMessage ? (
        <>
          <Alert kind="success">{sentMessage}</Alert>
          <p className="mt-3 text-[13px] text-[#16231F]/60">
            Didn&apos;t get it? Check your spam folder, or try again in a minute.
          </p>
        </>
      ) : (
        <>
          {error && <Alert kind="error">{error}</Alert>}
          <form className="mt-4 flex flex-col gap-[13px]" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
      <p className="mt-5 text-center text-[13px] text-[#16231F]/60">
        Remembered it?{" "}
        <Link href="/signin" className={linkClass}>
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}
