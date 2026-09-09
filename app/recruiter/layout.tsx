import type { ReactNode } from "react"
import { auth } from "@/auth"
import AppShell from "@/app/components/AppShell"

export default async function RecruiterLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  return (
    <AppShell role="recruiter" userName={session?.user?.name}>
      {children}
    </AppShell>
  )
}
