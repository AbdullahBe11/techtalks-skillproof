import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  if (!session?.user) { //see if they are sighned in
    redirect("/signin")
  }

  const role = (session.user as { role?: string }).role//get their role if they have one

  switch (role) { //redirect them to the page based on there role
    case "candidate":
      redirect("/candidate/projects")

    case "verifier":
      redirect("/verifier/queue")

    case "recruiter":
      redirect("/recruiter/browse")

    default:
      redirect("/signin")
  }
}