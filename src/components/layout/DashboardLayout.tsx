"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings, LayoutDashboard, Users, Building, BookOpen, MessageSquare, Calendar, Star, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  userName: string
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  const getNavItems = useMemo((): NavItem[] => {
    const baseItems = [
      { href: `/${userRole.toLowerCase()}`, label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> }
    ]

    switch (userRole) {
      case "ADMIN":
        return [
          ...baseItems,
          { href: "/admin/dashboard/users", label: "Users", icon: <Users className="h-4 w-4" /> },
          { href: "/admin/dashboard/organizations", label: "Organizations", icon: <Building className="h-4 w-4" /> },
          { href: "/admin/dashboard/trainings", label: "Trainings", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/admin/dashboard/maintainers", label: "Maintainers", icon: <Settings className="h-4 w-4" /> },
        ]
      case "FREELANCER":
        return [
          ...baseItems,
          { href: "/freelancer/dashboard/trainings", label: "Trainings", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/freelancer/dashboard/availability", label: "Availability", icon: <Calendar className="h-4 w-4" /> },
          { href: "/freelancer/dashboard/feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" /> },
        ]
      case "ORGANIZATION":
        return [
          ...baseItems,
          { href: "/organization/dashboard/trainings", label: "Trainings", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/organization/dashboard/freelancers", label: "Freelancers", icon: <Users className="h-4 w-4" /> },
          { href: "/organization/dashboard/verification", label: "Verification", icon: <Star className="h-4 w-4" /> },
        ]
      case "MAINTAINER":
        return [
          ...baseItems,
          { href: "/maintainer/dashboard/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
          { href: "/maintainer/dashboard/trainings", label: "Trainings", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/maintainer/dashboard/organizations", label: "Organizations", icon: <Building className="h-4 w-4" /> },
          { href: "/maintainer/dashboard/freelancers", label: "Freelancers", icon: <Users className="h-4 w-4" /> },
        ]
      default:
        return baseItems
    }
  }, [userRole])

  const navItems = getNavItems

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
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold truncate">{userName}</h2>
                <Badge variant="outline" className="text-xs">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 mt-6">
            <div className="px-4 space-y-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href || 
                                (item.href !== `/${userRole.toLowerCase()}` && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className={isActive ? "font-medium text-primary" : ""}>
                        {item.label}
                      </span>
                    </div>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-primary" />
                    )}
                  </Link>
                )
              })}
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