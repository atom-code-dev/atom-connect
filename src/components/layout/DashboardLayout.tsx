"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  userName: string
}

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Settings className="h-4 w-4" />
      case "FREELANCER":
        return <User className="h-4 w-4" />
      case "ORGANIZATION":
        return <User className="h-4 w-4" />
      case "MAINTAINER":
        return <Settings className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getNavItems = (role: string) => {
    switch (role) {
      case "ADMIN":
        return [
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/dashboard/users", label: "Users" },
          { href: "/admin/dashboard/organizations", label: "Organizations" },
          { href: "/admin/dashboard/trainings", label: "Trainings" },
          { href: "/admin/dashboard/maintainers", label: "Maintainers" },
        ]
      case "FREELANCER":
        return [
          { href: "/freelancer", label: "Dashboard" },
          { href: "/freelancer/dashboard/trainings", label: "Trainings" },
          { href: "/freelancer/dashboard/availability", label: "Availability" },
          { href: "/freelancer/dashboard/feedback", label: "Feedback" },
        ]
      case "ORGANIZATION":
        return [
          { href: "/organization", label: "Dashboard" },
          { href: "/organization/dashboard/trainings", label: "Trainings" },
          { href: "/organization/dashboard/freelancers", label: "Freelancers" },
          { href: "/organization/dashboard/verification", label: "Verification" },
        ]
      case "MAINTAINER":
        return [
          { href: "/maintainer", label: "Dashboard" },
          { href: "/maintainer/dashboard/reviews", label: "Reviews" },
          { href: "/maintainer/dashboard/trainings", label: "Trainings" },
          { href: "/maintainer/dashboard/organizations", label: "Organizations" },
          { href: "/maintainer/dashboard/freelancers", label: "Freelancers" },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems(userRole)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div 
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-64 bg-card border-r flex flex-col"
        >
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                {getRoleIcon(userRole)}
              </div>
              <div>
                <h2 className="font-semibold">{userName}</h2>
                <Badge variant="outline" className="text-xs">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 mt-6">
            <div className="px-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <ThemeToggle />
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>
        
        {/* Main content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-1 overflow-auto"
        >
          <main className="p-6">
            {children}
          </main>
        </motion.div>
      </div>
    </motion.div>
  )
}