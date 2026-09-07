import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Map each protected path prefix to the role allowed to access it
const ROLE_ROUTES: Record<string, string> = {
  "/candidate": "candidate",
  "/verifier": "verifier",
  "/recruiter": "recruiter",
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Find which role-protected prefix this request matches (if any)
  const matchedPrefix = Object.keys(ROLE_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  )

  // Not a protected route — let it through
  if (!matchedPrefix) {
    return NextResponse.next()
  }

  // No session at all — reject (401), not a redirect
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized: please sign in." },
      { status: 401 }
    )
  }

  const requiredRole = ROLE_ROUTES[matchedPrefix]
  const userRole = (session.user as any).role

  // Signed in, but wrong role — reject (403), enforced server-side
  if (userRole !== requiredRole) {
    return NextResponse.json(
      { error: "Forbidden: you do not have access to this page." },
      { status: 403 }
    )
  }

  // Correct role — allow through
  return NextResponse.next()
})

// Only run this middleware on the role-specific paths
export const config = {
  matcher: ["/candidate/:path*", "/verifier/:path*", "/recruiter/:path*"],
}