"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { LogOut, Home, Settings, Key, User, Minimize2, Maximize2 } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { ResetPasswordDialog } from "@/components/auth/ResetPasswordDialog"
import Link from "next/link"

interface TopbarProps {
  userRole: string
  userName: string
  isSidebarMinimized: boolean
  onToggleSidebar: () => void
}

export function Topbar({ userRole, userName, isSidebarMinimized, onToggleSidebar }: TopbarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  const getDashboardPath = () => {
    return `/${userRole.toLowerCase()}`
  }

  const isDashboardPage = pathname === getDashboardPath()

  // Only show reset password for non-freelancers
  const showResetPassword = userRole !== "FREELANCER"

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50"
    >
      {/* Left side - Breadcrumb/Navigation */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleSidebar}
          className="h-8 w-8 p-0 hover:bg-accent"
          title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          {isSidebarMinimized ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
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

      {/* Right side - Theme toggle and User Avatar */}
      <div className="flex items-center gap-3">
        <AnimatedThemeToggler className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground transition-colors" />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} alt={userName} />
                <AvatarFallback className="text-xs">
                  {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
              <Badge variant="outline" className="text-xs w-fit">
                {userRole}
              </Badge>
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col space-y-1">
              <Link href={`/${userRole.toLowerCase()}/account-settings`}>
                <Button variant="ghost" className="w-full justify-start gap-2 h-8">
                  <User className="h-4 w-4" />
                  Account Settings
                </Button>
              </Link>
              
              {showResetPassword && (
                <>
                  <Separator className="my-1" />
                  <ResetPasswordDialog>
                    <Button variant="ghost" className="w-full justify-start gap-2 h-8">
                      <Key className="h-4 w-4" />
                      Reset Password
                    </Button>
                  </ResetPasswordDialog>
                </>
              )}
              
              <Separator className="my-1" />
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  )
}