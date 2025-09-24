import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

const bcrypt = require('bcryptjs')

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
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

        try {
          // Find user in database
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              freelancerProfile: true,
              organizationProfile: true,
              adminProfile: true,
              maintainerProfile: true,
            }
          })

          if (!user) {
            return null
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          // If role is provided in credentials, verify it matches
          if (credentials.role && user.role !== credentials.role) {
            return null
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.name || 
                   user.freelancerProfile?.name || 
                   user.organizationProfile?.organizationName || 
                   'User',
            role: user.role,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
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
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/"
  }
}