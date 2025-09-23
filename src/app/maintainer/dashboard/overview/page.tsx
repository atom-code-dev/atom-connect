import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Building, BookOpen, TrendingUp, AlertCircle, CheckCircle, Clock, Star, Eye } from "lucide-react"

// Dummy data for maintainer dashboard
const dashboardStats = {
  pendingReviews: 15,
  activeTrainings: 45,
  organizations: 23,
  freelancers: 156,
  completedReviews: 89,
  averageReviewTime: "2.5 hours",
}

const recentReviews = [
  {
    id: "1",
    type: "organization",
    name: "TechCorp Solutions",
    action: "Verification Review",
    status: "APPROVED",
    time: "2 hours ago",
    reviewer: "Alice Johnson",
  },
  {
    id: "2",
    type: "training",
    name: "React.js Advanced Training",
    action: "Training Review",
    status: "PENDING",
    time: "4 hours ago",
    reviewer: "Bob Smith",
  },
  {
    id: "3",
    type: "freelancer",
    name: "John Doe",
    action: "Profile Review",
    status: "REJECTED",
    time: "6 hours ago",
    reviewer: "Carol Davis",
  },
  {
    id: "4",
    type: "organization",
    name: "Code Academy",
    action: "Verification Review",
    status: "APPROVED",
    time: "8 hours ago",
    reviewer: "David Wilson",
  },
]

const pendingItems = [
  {
    id: "1",
    type: "organization",
    name: "Innovation Labs",
    submittedBy: "Jane Smith",
    submittedDate: "2024-01-20",
    priority: "HIGH",
  },
  {
    id: "2",
    type: "training",
    name: "Python Fundamentals Course",
    submittedBy: "Code University",
    submittedDate: "2024-01-19",
    priority: "MEDIUM",
  },
  {
    id: "3",
    type: "freelancer",
    name: "Alice Brown",
    submittedBy: "alice@example.com",
    submittedDate: "2024-01-18",
    priority: "LOW",
  },
]

export default function MaintainerDashboardOverview() {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintainer Dashboard</h1>
          <p className="text-muted-foreground">Review and manage platform content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            {dashboardStats.pendingReviews} Pending
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              -3 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeTrainings}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.organizations}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.freelancers}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Alert */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Pending Reviews
          </CardTitle>
          <CardDescription className="text-orange-700">
            Items requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    {item.type === "organization" && <Building className="h-4 w-4 text-orange-600" />}
                    {item.type === "training" && <BookOpen className="h-4 w-4 text-orange-600" />}
                    {item.type === "freelancer" && <Users className="h-4 w-4 text-orange-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>by {item.submittedBy}</span>
                      <span>•</span>
                      <span>{new Date(item.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority}
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

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest review activities by maintainers</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {review.type === "organization" && <Building className="h-4 w-4 text-gray-600" />}
                    {review.type === "training" && <BookOpen className="h-4 w-4 text-gray-600" />}
                    {review.type === "freelancer" && <Users className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{review.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{review.action}</span>
                      <span>•</span>
                      <span>by {review.reviewer}</span>
                      <span>•</span>
                      <span>{review.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(review.status)}
                  <Badge variant={
                    review.status === "APPROVED" ? "default" :
                    review.status === "REJECTED" ? "destructive" : "outline"
                  }>
                    {review.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Your review efficiency and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Completed Reviews</span>
                <span className="font-medium">{dashboardStats.completedReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Review Time</span>
                <span className="font-medium">{dashboardStats.averageReviewTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Approval Rate</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>This Week</span>
                <span className="font-medium">12 reviews</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common maintainer tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Building className="h-4 w-4 mr-2" />
                Review Organizations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Review Trainings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Review Freelancers
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}