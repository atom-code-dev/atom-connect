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
    isNewUser?: boolean
  }
  error?: string
}

// Add initialization logging
console.log('LinkedIn OAuth - Auth options initialized:', {
  hasClientId: !!process.env.LINKEDIN_CLIENT_ID,
  hasClientSecret: !!process.env.LINKEDIN_CLIENT_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  authSecret: !!process.env.AUTH_SECRET
})

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
          scope: "openid profile email",
          response_type: "code",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`,
        },
      },
      userinfo: {
        async request({ tokens, client }) {
          try {
            console.log('LinkedIn OAuth - Requesting userinfo with access token:', tokens.access_token ? 'PRESENT' : 'MISSING')
            // Get user info from LinkedIn API
            const response = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            })
            
            console.log('LinkedIn OAuth - Userinfo response status:', response.status)
            
            if (!response.ok) {
              const errorText = await response.text()
              console.error('LinkedIn OAuth - API error response:', errorText)
              throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`)
            }
            
            const profile = await response.json()
            console.log('LinkedIn OAuth - Userinfo received:', JSON.stringify(profile, null, 2))
            
            return profile
          } catch (error) {
            console.error("LinkedIn OAuth - Userinfo request error:", error)
            throw error
          }
        }
      },
      profile(profile) {
        console.log('LinkedIn OAuth - Processing profile:', JSON.stringify(profile, null, 2))
        
        // Handle the new LinkedIn API format
        const id = profile.sub || profile.id
        const name = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn User'
        const email = profile.email || profile.email_address || ''
        const picture = profile.picture || profile.image
        
        console.log('LinkedIn OAuth - Extracted data:', { id, name, email: email ? 'PRESENT' : 'MISSING', picture: picture ? 'PRESENT' : 'MISSING' })
        
        if (!email) {
          console.error('LinkedIn OAuth - Profile missing email:', profile)
          throw new Error('Email is required from LinkedIn profile')
        }
        
        return {
          id: id,
          name: name,
          email: email,
          image: picture,
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
      console.log('LinkedIn OAuth - JWT callback called:', { 
        hasToken: !!token, 
        hasUser: !!user, 
        hasAccount: !!account,
        accountProvider: account?.provider 
      })
      
      if (user) {
        token.role = user.role
        token.id = user.id
        console.log('LinkedIn OAuth - User data added to token:', { role: user.role, id: user.id })
      }
      
      // Handle LinkedIn sign-in
      if (account?.provider === "linkedin") {
        console.log('LinkedIn OAuth - Processing LinkedIn account')
        try {
          console.log('LinkedIn OAuth - Token data:', { 
            email: token.email ? 'PRESENT' : 'MISSING', 
            name: token.name ? 'PRESENT' : 'MISSING' 
          })
          
          // Validate required fields
          if (!token.email) {
            throw new Error("Email is required from LinkedIn profile")
          }
          
          // Check if user exists in database
          const existingUser = await db.user.findUnique({
            where: { email: token.email }
          })

          if (!existingUser) {
            console.log('LinkedIn OAuth - Creating new user from LinkedIn OAuth')
            // New user - create temporary password and user record
            const tempPassword = Math.random().toString(36).slice(-12)
            const hashedPassword = await bcrypt.hash(tempPassword, 12)
            
            const newUser = await db.user.create({
              data: {
                email: token.email!,
                name: token.name!,
                password: hashedPassword,
                role: "FREELANCER",
                freelancerProfile: {
                  create: {
                    name: token.name!,
                    email: token.email!,
                    profileImage: token.picture,
                    experience: "LinkedIn authenticated freelancer", // Required field
                  }
                }
              }
            })
            
            token.id = newUser.id
            token.role = newUser.role
            token.isNewUser = true
            console.log('LinkedIn OAuth - New user created successfully:', newUser.id)
          } else {
            console.log('LinkedIn OAuth - Existing user found:', existingUser.id)
            // Existing user - check if they are a freelancer
            if (existingUser.role !== "FREELANCER") {
              console.error('LinkedIn OAuth - Non-freelancer attempting LinkedIn login:', existingUser.role)
              throw new Error("Only freelancers can use LinkedIn login")
            }
            
            token.id = existingUser.id
            token.role = existingUser.role
            token.isNewUser = false
          }
          
          console.log('LinkedIn OAuth - JWT callback completed successfully')
        } catch (error) {
          console.error("LinkedIn OAuth - Error in JWT callback:", error)
          // Throw the error to be handled by NextAuth
          throw error
        }
      }
      
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('LinkedIn OAuth - Session callback called:', { 
        hasSession: !!session, 
        hasToken: !!token,
        tokenId: token.id,
        tokenRole: token.role,
        isNewUser: token.isNewUser
      })
      
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.isNewUser = token.isNewUser as boolean
        console.log('LinkedIn OAuth - Session data set:', { 
          id: token.id, 
          role: token.role, 
          isNewUser: token.isNewUser 
        })
      }
      
      console.log('LinkedIn OAuth - Session callback completed')
      return session
    }
  },
  pages: {
    signIn: "/"
  }
}