"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  name: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  userName: string
}

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r flex flex-col">
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
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}