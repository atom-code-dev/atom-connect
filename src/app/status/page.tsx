"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { Loader2, Clock, XCircle, AlertTriangle, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"

type StatusType = 'pending' | 'approved' | 'rejected' | 'disabled'

interface StatusData {
  type: StatusType
  role: string
  message: string
  details?: string
  rejectionReason?: string
}

export default function StatusPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/user/status")
        if (response.ok) {
          const data = await response.json()
          setStatusData(data)
        } else {
          // If there's an error, redirect to login
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching status:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchStatus()
    } else if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getStatusIcon = (type: StatusType) => {
    switch (type) {
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />
      case 'approved':
        return <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      case 'rejected':
        return <XCircle className="h-12 w-12 text-red-500" />
      case 'disabled':
        return <AlertTriangle className="h-12 w-12 text-red-500" />
      default:
        return <Clock className="h-12 w-12 text-yellow-500" />
    }
  }

  const getStatusColor = (type: StatusType) => {
    switch (type) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'disabled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusTitle = (type: StatusType) => {
    switch (type) {
      case 'pending':
        return 'Waiting for Approval'
      case 'approved':
        return 'Account Approved'
      case 'rejected':
        return 'Account Rejected'
      case 'disabled':
        return 'Account Locked'
      default:
        return 'Account Status'
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading status...</p>
        </div>
      </div>
    )
  }

  if (!statusData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Unable to load account status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className={`border-2 ${getStatusColor(statusData.type)}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(statusData.type)}
            </div>
            <CardTitle className="text-2xl">{getStatusTitle(statusData.type)}</CardTitle>
            <CardDescription className="text-base">
              {statusData.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Additional Details */}
            {statusData.details && (
              <div className="text-sm text-muted-foreground text-center">
                {statusData.details}
              </div>
            )}

            {/* Rejection Reason */}
            {statusData.type === 'rejected' && statusData.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Reason for Rejection:</h4>
                <p className="text-sm text-red-700">{statusData.rejectionReason}</p>
              </div>
            )}

            {/* Contact Support */}
            {(statusData.type === 'rejected' || statusData.type === 'disabled') && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Contact Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">support@atomconnect.in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-700">+91 XXXXXXXXXX</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {statusData.type === 'approved' && (
                <Button 
                  onClick={() => {
                    if (statusData.role === 'ORGANIZATION') {
                      router.push("/organization")
                    } else if (statusData.role === 'FREELANCER') {
                      router.push("/freelancer")
                    }
                  }} 
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              )}
              
              {(statusData.type === 'pending' || statusData.type === 'rejected') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (statusData.role === 'ORGANIZATION') {
                      router.push("/organization")
                    } else if (statusData.role === 'FREELANCER') {
                      router.push("/freelancer")
                    }
                  }} 
                  className="w-full"
                >
                  Back to {statusData.role === 'ORGANIZATION' ? 'Organization' : 'Freelancer'} Portal
                </Button>
              )}

              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>

            {/* Auto-refresh for pending status */}
            {statusData.type === 'pending' && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  This page will automatically refresh when your status changes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}