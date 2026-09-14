import EmptyState from "@/app/components/EmptyState"

export default function VerifierQueuePage() {
  return (
    <main>
      <h1>Review Queue</h1>
      <EmptyState
        headline="Queue is clear"
        description="No projects are waiting for review right now."
      />
    </main>
  )
}
