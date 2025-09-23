"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Star } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  name: string
}

// Dummy data for organization dashboard
const dashboardStats = {
  activeTrainings: 8,
  totalApplications: 45,
  completedTrainings: 12,
  averageRating: 4.5,
  pendingVerifications: 2,
}

const recentTrainings = [
  {
    id: "1",
    title: "React.js Advanced Training",
    applications: 12,
    status: "ACTIVE",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
  },
  {
    id: "2",
    title: "Leadership & Communication Skills",
    applications: 8,
    status: "COMPLETED",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
  },
  {
    id: "3",
    title: "Python Fundamentals Course",
    applications: 25,
    status: "PENDING",
    startDate: "2024-02-20",
    endDate: "2024-03-20",
  },
]

const recentApplications = [
  {
    id: "1",
    trainingTitle: "React.js Advanced Training",
    applicantName: "John Doe",
    appliedDate: "2024-01-20",
    status: "PENDING",
  },
  {
    id: "2",
    trainingTitle: "Python Fundamentals Course",
    applicantName: "Jane Smith",
    appliedDate: "2024-01-19",
    status: "REVIEWED",
  },
  {
    id: "3",
    trainingTitle: "Leadership & Communication Skills",
    applicantName: "Bob Johnson",
    appliedDate: "2024-01-18",
    status: "ACCEPTED",
  },
]

export default function OrganizationDashboardOverview() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (status === "authenticated" && session?.user?.role !== "ORGANIZATION") {
      router.push("/")
      return
    }
  }, [status, session, router])

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

  if (!session || session.user.role !== "ORGANIZATION") {
    return null
  }

  const user = session.user

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-muted-foreground">Manage your trainings and find expert trainers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            {dashboardStats.pendingVerifications} Pending
          </Button>
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Post Training
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeTrainings}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.completedTrainings}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              Based on 45 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trainings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Trainings</CardTitle>
              <CardDescription>Your latest training postings</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTrainings.map((training) => (
              <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{training.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{training.applications} applications</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    training.status === "ACTIVE" ? "default" : 
                    training.status === "COMPLETED" ? "secondary" : "outline"
                  }>
                    {training.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest trainer applications for your trainings</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{application.trainingTitle}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Applied by: {application.applicantName}</span>
                    <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    application.status === "PENDING" ? "outline" :
                    application.status === "REVIEWED" ? "secondary" : "default"
                  }>
                    {application.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <CardTitle className="text-lg">Post Training</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Create a new training posting
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <CardTitle className="text-lg">Find Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Search for expert trainers
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <CardTitle className="text-lg">Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              View training performance
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <CardTitle className="text-lg">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Check verification status
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  )
}