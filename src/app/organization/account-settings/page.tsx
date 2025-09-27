"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { AccountSettings } from "@/components/account/AccountSettings"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function OrganizationAccountSettingsPage() {
  const { data: session, status } = useSession()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch organization profile data
      fetch("/api/organization/profile")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProfileData(data.profile)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <DashboardLayout userRole="ORGANIZATION" userName="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null // Will be redirected by auth
  }

  return (
    <DashboardLayout userRole="ORGANIZATION" userName={session.user.name || "Organization"}>
      <AccountSettings 
        userRole="ORGANIZATION" 
        initialData={profileData}
      />
    </DashboardLayout>
  )
}