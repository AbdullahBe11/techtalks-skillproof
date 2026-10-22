"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RemoveButton({
  candidateId,
  name,
}: {
  candidateId: string
  name: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")

  async function handleRemove() {
    setStatus("loading")
    try {
      const res = await fetch(`/api/recruiter/shortlist/${candidateId}`, {
        method: "DELETE",
      })

      // Already removed — treat as success.
      if (!res.ok && res.status !== 404) {
        setStatus("error")
        return
      }

      router.refresh()
    } catch {
      setStatus("error")
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={status === "loading"}
      aria-label={`Remove ${name} from shortlist`}
      className="rounded border border-line bg-wash/30 px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-wash/60 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      {status === "loading" ? "Removing…" : "Remove"}
    </button>
  )
}