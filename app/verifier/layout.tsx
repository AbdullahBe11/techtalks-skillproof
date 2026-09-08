import type { ReactNode } from "react"
import { auth } from "@/auth"
import AppShell from "@/app/components/AppShell"

export default async function VerifierLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  return (
    <AppShell role="verifier" userName={session?.user?.name}>
      {children}
    </AppShell>
  )
}
