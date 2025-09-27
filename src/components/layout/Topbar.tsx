"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Home } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import Link from "next/link"

interface TopbarProps {
  userRole: string
  userName: string
}

export function Topbar({ userRole, userName }: TopbarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  const getDashboardPath = () => {
    return `/${userRole.toLowerCase()}`
  }

  const isDashboardPage = pathname === getDashboardPath()

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50"
    >
      {/* Left side - Breadcrumb/Navigation */}
      <div className="flex items-center gap-3">
        <Link href={getDashboardPath()}>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
        </Link>
        <div>
          <h1 className="font-semibold text-foreground">
            {isDashboardPage ? 'Dashboard' : pathname.split('/').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{userName}</span>
            <Badge variant="outline" className="text-xs">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right side - Theme toggle and Logout */}
      <div className="flex items-center gap-3">
        <AnimatedThemeToggler className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground transition-colors" />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </motion.div>
  )
}