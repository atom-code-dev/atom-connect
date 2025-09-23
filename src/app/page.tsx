"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, User, Building, Settings, Users } from "lucide-react"
import { toast } from "sonner"

// Mock user credentials for demo
const mockUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    role: "ADMIN",
    name: "Admin User"
  },
  {
    id: "2",
    email: "freelancer@example.com",
    password: "freelancer123",
    role: "FREELANCER",
    name: "John Doe"
  },
  {
    id: "3",
    email: "organization@example.com",
    password: "organization123",
    role: "ORGANIZATION",
    name: "TechCorp Solutions"
  },
  {
    id: "4",
    email: "maintainer@example.com",
    password: "maintainer123",
    role: "MAINTAINER",
    name: "Alice Johnson"
  }
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email,
          password,
          role: selectedRole,
          redirect: false,
        })

        if (result?.error) {
          setError("Invalid email, password, or role")
          toast.error("Login failed. Please check your credentials.")
        } else {
          toast.success("Login successful!")
          
          // Get user role from localStorage or session
          const user = mockUsers.find(u => u.email === email)
          if (user) {
            switch (user.role) {
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
        }
      } catch (err) {
        setError("Login failed. Please try again.")
        toast.error("An error occurred during login.")
      }
    })
  }

  const handleQuickLogin = (user: typeof mockUsers[0]) => {
    setEmail(user.email)
    setPassword(user.password)
    setSelectedRole(user.role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Atom Connect</h1>
          <p className="text-gray-600 mt-2">Trainer & Organization Connect</p>
        </div>

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

              <div className="space-y-2">
                <Label htmlFor="role">Role (Optional)</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="FREELANCER">Freelancer</SelectItem>
                    <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    <SelectItem value="MAINTAINER">Maintainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Quick Login
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Admin</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin(mockUsers[0])}
                  >
                    Use
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Freelancer</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin(mockUsers[1])}
                  >
                    Use
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">Organization</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin(mockUsers[2])}
                  >
                    Use
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Maintainer</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickLogin(mockUsers[3])}
                  >
                    Use
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo credentials are provided above for quick access.</p>
          <p className="mt-1">Click "Use" to auto-fill the form.</p>
        </div>
      </div>
    </div>
  )
}