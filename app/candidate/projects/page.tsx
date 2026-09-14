import EmptyState from "@/app/components/EmptyState"

export default function CandidateProjectsPage() {
  return (
    <main>
      <h1>My Projects</h1>
      <EmptyState
        headline="No projects yet"
        description="Submit your first project to start building a verified profile."
        ctaLabel="Submit a project →"
        // TODO: point this at the real submission route once it exists.
        ctaHref="#"
      />
    </main>
  )
}
