import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Mock user validation for now
        if (credentials.email === "admin@example.com" && credentials.password === "admin123") {
          return {
            id: "1",
            email: "admin@example.com",
            name: "Admin User",
            role: "ADMIN",
          }
        }
        
        if (credentials.email === "freelancer@example.com" && credentials.password === "freelancer123") {
          return {
            id: "2",
            email: "freelancer@example.com",
            name: "John Doe",
            role: "FREELANCER",
          }
        }
        
        if (credentials.email === "organization@example.com" && credentials.password === "organization123") {
          return {
            id: "3",
            email: "organization@example.com",
            name: "TechCorp Solutions",
            role: "ORGANIZATION",
          }
        }
        
        if (credentials.email === "maintainer@example.com" && credentials.password === "maintainer123") {
          return {
            id: "4",
            email: "maintainer@example.com",
            name: "Alice Johnson",
            role: "MAINTAINER",
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/"
  }
})

export { handler as GET, handler as POST }