"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LayoutDashboard, Users, Building, BookOpen, MessageSquare, Calendar, Star, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Topbar } from "./Topbar"
import Link from "next/link"
import HexagonLoader from "@/components/ui/hexagon-loader"

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

interface SidebarProps {
  userRole: string
  pathname: string
  isMinimized: boolean
}

const Sidebar = React.memo(({ userRole, pathname, isMinimized }: SidebarProps) => {
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
          { href: "/admin/dashboard/maintainers", label: "Maintainers", icon: <User className="h-4 w-4" /> },
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
          { href: "/maintainer/dashboard/analytics", label: "Analytics", icon: <LayoutDashboard className="h-4 w-4" /> },
          { href: "/maintainer/dashboard/trainings", label: "Trainings", icon: <BookOpen className="h-4 w-4" /> },
          { href: "/maintainer/dashboard/organizations", label: "Organizations", icon: <Building className="h-4 w-4" /> },
          { href: "/maintainer/dashboard/freelancers", label: "Freelancers", icon: <Users className="h-4 w-4" /> },
        ]
      default:
        return baseItems
    }
  }, [userRole])

  const navItems = getNavItems

  return (
    <motion.div 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`${isMinimized ? 'w-16' : 'w-64'} bg-card border-r flex flex-col transition-all duration-300`}
    >
      <nav className="flex-1 mt-6">
        <div className="px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href !== `/${userRole.toLowerCase()}` && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors group ${
                  isActive ? (isMinimized ? 'bg-primary/10' : 'bg-accent') : ''
                }`}
                title={isMinimized ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded ${isActive && isMinimized ? 'bg-primary text-primary-foreground' : ''}`}>
                    {item.icon}
                  </div>
                  {!isMinimized && (
                    <span className={isActive ? "font-medium text-primary" : ""}>
                      {item.label}
                    </span>
                  )}
                </div>
                {!isMinimized && isActive && (
                  <ChevronRight className="h-4 w-4 text-primary" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </motion.div>
  )
})

Sidebar.displayName = "Sidebar"

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarMinimized, setIsSidebarMinimized] = React.useState(false)

  // Load sidebar state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem('sidebar-minimized')
    if (savedState !== null) {
      setIsSidebarMinimized(savedState === 'true')
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  const toggleSidebar = React.useCallback(() => {
    const newState = !isSidebarMinimized
    setIsSidebarMinimized(newState)
    localStorage.setItem('sidebar-minimized', newState.toString())
  }, [isSidebarMinimized])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const isDashboardPage = pathname === `/${userRole.toLowerCase()}`

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Topbar - Fixed */}
      <Topbar 
        userRole={userRole}
        userName={userName}
        isSidebarMinimized={isSidebarMinimized}
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed topbar */}
        {/* Sidebar */}
        <Sidebar 
          userRole={userRole}
          pathname={pathname}
          isMinimized={isSidebarMinimized}
        />
        
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