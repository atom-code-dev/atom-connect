"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, TrendingUp, CheckCircle, Clock, Star, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  name: string
}

// Dummy data for freelancer dashboard
const dashboardStats = {
  availableTrainings: 25,
  appliedTrainings: 8,
  completedTrainings: 12,
  averageRating: 4.7,
  profileCompleted: true,
}

const recentApplications = [
  {
    id: "1",
    trainingTitle: "React.js Advanced Training",
    companyName: "TechCorp Solutions",
    appliedDate: "2024-01-20",
    status: "PENDING",
    location: "Bangalore, Karnataka",
    payment: 50000,
  },
  {
    id: "2",
    trainingTitle: "Python Fundamentals Course",
    companyName: "Code University",
    appliedDate: "2024-01-19",
    status: "REVIEWED",
    location: "Delhi, Delhi",
    payment: 75000,
  },
  {
    id: "3",
    trainingTitle: "Leadership & Communication Skills",
    companyName: "Leadership Academy",
    appliedDate: "2024-01-18",
    status: "ACCEPTED",
    location: "Mumbai, Maharashtra",
    payment: 35000,
  },
]

const recommendedTrainings = [
  {
    id: "1",
    title: "Node.js Backend Development",
    companyName: "DevWorks Inc.",
    location: "Pune, Maharashtra",
    payment: 60000,
    matchScore: 95,
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: "2",
    title: "Data Science with R",
    companyName: "Data Science Institute",
    location: "Chennai, Tamil Nadu",
    payment: 80000,
    matchScore: 88,
    skills: ["R", "Statistics", "Machine Learning"],
  },
  {
    id: "3",
    title: "Angular Development",
    companyName: "WebTech Solutions",
    location: "Hyderabad, Telangana",
    payment: 55000,
    matchScore: 82,
    skills: ["Angular", "TypeScript", "RxJS"],
  },
]

const freelancerProfile = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+91-9876543210",
  skills: ["React.js", "Node.js", "TypeScript", "MongoDB", "Python"],
  trainerType: "CORPORATE",
  experience: "5+ years of experience in full-stack development",
  location: "Bangalore, Karnataka",
  availability: "AVAILABLE",
  rating: 4.8,
  completedTrainings: 25,
  linkedinProfile: "https://linkedin.com/in/johndoe",
}

export default function FreelancerDashboardOverview() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "FREELANCER") {
      router.push("/")
      return
    }
    
    setUser(parsedUser)
  }, [router])

  if (!user) {
    return <div>Loading...</div>
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REVIEWED":
        return "bg-blue-100 text-blue-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800"
      case "IN_TRAINING":
        return "bg-yellow-100 text-yellow-800"
      case "NOT_AVAILABLE":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
          <p className="text-muted-foreground">Find trainings and manage your profile</p>
        </div>
        <div className="flex gap-2">
          {!dashboardStats.profileCompleted && (
            <Button variant="outline">
              <Briefcase className="h-4 w-4 mr-2" />
              Complete Profile
            </Button>
          )}
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Find Trainings
          </Button>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!dashboardStats.profileCompleted && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-orange-700">
              Complete your profile to increase your chances of getting selected for trainings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Complete Profile Now
            </Button>
          </CardContent>
        </Card>
      )}

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
              Based on {dashboardStats.completedTrainings} trainings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Profile Summary
          </CardTitle>
          <CardDescription>Your current profile status and information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{freelancerProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{freelancerProfile.email}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{freelancerProfile.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{freelancerProfile.location}</span>
              </div>
              
              <div>
                <Badge className={getAvailabilityColor(freelancerProfile.availability)}>
                  {freelancerProfile.availability.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">{freelancerProfile.experience}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {freelancerProfile.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Trainer Type</h4>
                <Badge variant="outline">{freelancerProfile.trainerType}</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  Update Availability
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest training applications</CardDescription>
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
                    <span>{application.companyName}</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{application.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{application.payment.toLocaleString()}</span>
                    </div>
                    <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(application.status)}>
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

      {/* Recommended Trainings */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recommended Trainings</CardTitle>
              <CardDescription>Trainings that match your skills and experience</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                    <Badge variant="outline">{training.matchScore}% match</Badge>
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">
                    {training.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{training.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>{training.payment.toLocaleString()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {training.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <CardTitle className="text-lg">Find Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Search for available trainings
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <CardTitle className="text-lg">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Update your profile information
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
              Update your availability status
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
              View your training feedback
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}