import EmptyState from "@/app/components/EmptyState"

export default function RecruiterBrowsePage() {
  return (
    <main>
      <h1>Browse Candidates</h1>
      <EmptyState
        headline="No verified profiles yet"
        description="Check back once candidates have opted in to visibility."
      />
    </main>
  )
}
