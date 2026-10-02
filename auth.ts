import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

if (!passwordMatches) {
  return null
}

if (!user.emailVerifiedAt) {
  throw new EmailNotVerifiedError()
}

return {
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
}
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as { id?: string; role?: string }
        sessionUser.id = token.sub
        sessionUser.role = token.role as string | undefined
      }
      return session
    },
  },
  pages: { signIn: "/signin" },
})