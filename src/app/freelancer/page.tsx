"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Star } from "lucide-react"
import HexagonLoader from "@/components/ui/hexagon-loader"

interface User {
  id: string
  email: string
  role: string
  name: string
}

export default function FreelancerPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return // Still loading, do nothing
    
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (session?.user?.role !== "FREELANCER") {
      router.push("/")
      return
    }
    
    setUser({
      id: session.user.id || "",
      email: session.user.email || "",
      role: session.user.role || "",
      name: session.user.name || ""
    })
  }, [session, status, router])

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

  if (!user) {
    return <div>Loading...</div>
  }

  // Dummy data for freelancer dashboard
  const dashboardStats = {
    availableTrainings: 25,
    appliedTrainings: 8,
    completedTrainings: 12,
    averageRating: 4.7,
    pendingApplications: 3,
  }

  const availableTrainings = [
    {
      id: "1",
      title: "React.js Advanced Training",
      company: "TechCorp Solutions",
      location: "Bangalore, Karnataka",
      payment: 50000,
      duration: "5 days",
      postedDate: "2024-01-20",
    },
    {
      id: "2",
      title: "Python Fundamentals Course",
      company: "Code University",
      location: "Delhi, Delhi",
      payment: 75000,
      duration: "30 days",
      postedDate: "2024-01-19",
    },
    {
      id: "3",
      title: "Leadership & Communication Skills",
      company: "Leadership Academy",
      location: "Mumbai, Maharashtra",
      payment: 35000,
      duration: "2 days",
      postedDate: "2024-01-18",
    },
  ]

  const applicationStatus = [
    {
      id: "1",
      trainingTitle: "Node.js Backend Development",
      company: "DevWorks Inc.",
      appliedDate: "2024-01-20",
      status: "PENDING",
    },
    {
      id: "2",
      trainingTitle: "Data Science with R",
      company: "Data Science Institute",
      appliedDate: "2024-01-19",
      status: "REVIEWED",
    },
    {
      id: "3",
      trainingTitle: "Machine Learning Workshop",
      company: "AI Academy",
      appliedDate: "2024-01-18",
      status: "ACCEPTED",
    },
  ]

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
            <p className="text-muted-foreground">Find training opportunities and manage your profile</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              {dashboardStats.pendingApplications} Pending
            </Button>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Trainings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Trainings</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.availableTrainings}</div>
              <p className="text-xs text-muted-foreground">
                +5 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.appliedTrainings}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
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

        {/* Available Trainings */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recommended Trainings</CardTitle>
                <CardDescription>Trainings matching your skills and experience</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableTrainings.map((training) => (
                <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{training.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Company: {training.company}</span>
                      <span>Location: {training.location}</span>
                      <span>Duration: {training.duration}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-semibold">₹{training.payment.toLocaleString()}</span>
                      <span className="text-muted-foreground">Posted: {new Date(training.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Apply Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Track your training applications</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applicationStatus.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{application.trainingTitle}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Company: {application.company}</span>
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
                      View Details
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
              <CardTitle className="text-lg">Browse Trainings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center text-muted-foreground">
                Find new opportunities
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <CardTitle className="text-lg">My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center text-muted-foreground">
                Update your information
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center text-muted-foreground">
                Set your availability
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <CardTitle className="text-lg">Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center text-muted-foreground">
                View your reviews
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}