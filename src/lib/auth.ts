import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import LinkedInProvider from "next-auth/providers/linkedin"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import * as bcrypt from 'bcryptjs'
import { JWT } from "next-auth/jwt"
import { User, Session } from "next-auth"

interface CustomUser extends User {
  role: UserRole
}

interface CustomToken {
  role?: UserRole
  id?: string
}

interface CustomSession extends Session {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "your-secret-key",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        console.log('Authorize attempt:', credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
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

          console.log('User found:', !!user)

          if (!user) {
            console.log('User not found')
            return null
          }

          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('Invalid password')
            return null
          }

          // If role is provided in credentials, verify it matches
          if (credentials.role && user.role !== credentials.role) {
            console.log('Role mismatch')
            return null
          }

          // Return user object for session
          const result = {
            id: user.id,
            email: user.email,
            name: user.name || 
                   user.freelancerProfile?.name || 
                   user.organizationProfile?.organizationName || 
                   'User',
            role: user.role,
          }
          console.log('Authorization successful:', result)
          return result
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "r_liteprofile r_emailaddress",
        },
      },
      profile(profile) {
        console.log('LinkedIn profile received:', profile)
        
        // Handle different profile formats from LinkedIn API
        const id = profile.id || profile.sub
        const firstName = profile.localizedFirstName || profile.firstName || ''
        const lastName = profile.localizedLastName || profile.lastName || ''
        const name = `${firstName} ${lastName}`.trim() || profile.name || 'LinkedIn User'
        const email = profile.emailAddress || profile.email || ''
        const image = profile.picture || profile.image || null
        
        return {
          id: id,
          name: name,
          email: email,
          image: image,
          role: "FREELANCER" as UserRole,
        }
      },
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: CustomUser; account?: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      
      // Handle LinkedIn sign-in
      if (account?.provider === "linkedin") {
        try {
          console.log('LinkedIn callback - token:', { email: token.email, name: token.name })
          
          // Check if user exists in database
          const existingUser = await db.user.findUnique({
            where: { email: token.email! }
          })

          if (!existingUser) {
            console.log('Creating new user from LinkedIn OAuth')
            // New user - create temporary password and user record
            const tempPassword = Math.random().toString(36).slice(-12)
            const hashedPassword = await bcrypt.hash(tempPassword, 12)
            
            const newUser = await db.user.create({
              data: {
                email: token.email!,
                name: token.name!,
                password: hashedPassword,
                role: "FREELANCER",
                image: token.picture,
                freelancerProfile: {
                  create: {
                    name: token.name!,
                    email: token.email!,
                    profileImage: token.picture,
                  }
                }
              }
            })
            
            token.id = newUser.id
            token.role = newUser.role
            token.isNewUser = true
            console.log('New user created successfully:', newUser.id)
          } else {
            console.log('Existing user found:', existingUser.id)
            // Existing user - check if they are a freelancer
            if (existingUser.role !== "FREELANCER") {
              console.error('Non-freelancer attempting LinkedIn login:', existingUser.role)
              throw new Error("Only freelancers can use LinkedIn login")
            }
            
            token.id = existingUser.id
            token.role = existingUser.role
            token.isNewUser = false
          }
        } catch (error) {
          console.error("Error in LinkedIn callback:", error)
          throw error
        }
      }
      
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.isNewUser = token.isNewUser as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/"
  }
}