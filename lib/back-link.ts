// Where the "←" link in the public header should take a signed-in user.
// Recruiters, candidates and verifiers go back to their own dashboard;
// everyone else (signed out, or an unknown role) goes to the public
// "Browse verified projects" page.

export type BackLink = { href: string; label: string }

const BACK_LINKS: Record<string, BackLink> = {
  recruiter: { href: "/recruiter/browse", label: "Back to candidates" },
  candidate: { href: "/candidate/projects", label: "Back to my projects" },
  verifier: { href: "/verifier/queue", label: "Back to review queue" },
}

const PUBLIC_BACK_LINK: BackLink = {
  href: "/projects",
  label: "Browse verified projects",
}

export function backLinkForRole(role: string | null | undefined): BackLink {
  return (role && BACK_LINKS[role]) || PUBLIC_BACK_LINK
}
