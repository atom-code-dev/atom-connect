"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Users, Linkedin } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import HexagonLoader from "@/components/ui/hexagon-loader"
import Link from "next/link"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()

  // Debug: Log environment variables on component mount
  useEffect(() => {
    console.log('Environment variables check:')
    console.log('NEXT_PUBLIC_LINKEDIN_CLIENT_ID:', process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID)
    console.log('All NEXT_PUBLIC_ vars:', {
      NEXT_PUBLIC_LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
    })
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      // Check for LinkedIn authentication errors
      if (session.error) {
        setError(session.error)
        toast.error(session.error)
        return
      }
      
      // Check if user is new and needs to complete profile
      if (session.user.isNewUser) {
        router.push("/complete-profile")
        return
      }
      
      // Redirect based on user role
      const userRole = session?.user?.role
      switch (userRole) {
        case "ADMIN":
          router.push("/admin")
          break
        case "FREELANCER":
          router.push("/freelancer")
          break
        case "ORGANIZATION":
          router.push("/organization")
          break
        case "MAINTAINER":
          router.push("/maintainer")
          break
        default:
          router.push("/")
      }
    }
  }, [status, session, router])

  // If user is authenticated, don't show the login page
  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <HexagonLoader size={64} className="mb-4" />
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // If loading, show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <HexagonLoader size={64} className="mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError("Invalid email or password")
          toast.error("Login failed. Please check your credentials.")
        } else {
          toast.success("Login successful!")
          // The redirect will be handled by the useEffect hook based on the session
        }
      } catch (err) {
        setError("Login failed. Please try again.")
        toast.error("An error occurred during login.")
      }
    })
  }

  const handleLinkedInLogin = async () => {
    try {
      console.log('Starting LinkedIn login process...')
      
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID) {
        console.error('NEXT_PUBLIC_LINKEDIN_CLIENT_ID is not set:', process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID)
        setError("LinkedIn login is not configured")
        toast.error("LinkedIn login is not properly configured. Please contact support.")
        return
      }
      
      // Use the correct callback URL
      const callbackUrl = window.location.origin + "/complete-profile"
      console.log('Using callback URL:', callbackUrl)
      
      const result = await signIn("linkedin", { 
        callbackUrl,
        redirect: true  // Let NextAuth handle the redirect
      })
      
      console.log('LinkedIn login result:', result)
      
      // If we get here, it means the redirect didn't happen
      if (result?.error) {
        console.error('LinkedIn login error:', result.error)
        setError("LinkedIn login failed")
        toast.error("LinkedIn login failed. Please try again.")
      }
    } catch (err) {
      console.error('LinkedIn login exception:', err)
      setError("LinkedIn login failed. Please try again.")
      toast.error("An error occurred during LinkedIn login.")
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex items-center justify-center p-4"
    >
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <div className="backdrop-blur-sm p-1">
          <AnimatedThemeToggler className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors" />
        </div>
      </div>
      
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Atom Connect</h1>
          <p className="text-muted-foreground mt-2">Trainer & Organization Connect</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-destructive text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20"
                  >
                    {error}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isPending}
                >
                  {isPending ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLinkedInLogin}
                  disabled={isPending}
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  Continue with LinkedIn
                  <span className="text-xs text-muted-foreground ml-2">(Freelancers only)</span>
                </Button>

                <div className="text-center space-y-2">
                  <Link href="/register-organization">
                    <Button variant="link" className="text-sm h-auto p-0">
                      Register your organization
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>Please contact your administrator for login credentials.</p>
        </motion.div>
      </div>
    </motion.div>
  )
}