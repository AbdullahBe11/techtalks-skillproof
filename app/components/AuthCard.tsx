import type { ReactNode } from "react"

// Shared look for the small account pages (forgot / reset password):
// same colors, wordmark and serif headings as the sign-in page.
export const serif = { fontFamily: "var(--font-serif, Georgia, serif)" } as const

export const inputClass =
  "w-full rounded border border-line bg-paper px-3 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-brand focus:ring-1 focus:ring-brand"
export const labelClass = "block text-[13px] font-medium text-ink/70 mb-1"
export const buttonClass =
  "mt-1 w-full rounded bg-ink py-3 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand-light focus-visible:outline-offset-2"
export const linkClass =
  "font-medium text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 focus-visible:rounded-sm"

export function Alert({ kind, children }: { kind: "error" | "success"; children: ReactNode }) {
  const color = kind === "error" ? "var(--danger)" : "var(--brand)"
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className="mt-4 rounded border-l-2 px-3 py-2 text-[13px]"
      style={{
        borderColor: color,
        color,
        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
      }}
    >
      {children}
    </div>
  )
}

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-[400px] rounded-md border border-line bg-paper p-7 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand">
            <svg
              viewBox="0 0 24 24"
              className="h-[60%] w-[60%]"
              fill="none"
              stroke="#F6F4EE"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="text-[20px] font-semibold text-ink" style={serif}>
            SkillProof
          </span>
        </div>
        <h1 className="mt-5 text-[18px] font-semibold text-ink" style={serif}>
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink/60">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
