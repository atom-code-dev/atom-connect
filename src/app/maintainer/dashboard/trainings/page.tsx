"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Edit, Trash2, BookOpen, MapPin, DollarSign, Users, Calendar } from "lucide-react"
import { format } from "date-fns"

// Dummy data for maintainer trainings
const dummyTrainings = [
  {
    id: "1",
    title: "React.js Advanced Training",
    description: "Learn advanced React concepts including hooks, context, and performance optimization",
    companyName: "TechCorp Solutions",
    stack: "React.js",
    category: "FRAMEWORKS",
    type: "CORPORATE",
    location: "Bangalore, Karnataka",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    paymentAmount: 50000,
    paymentTerm: 30,
    isPublished: true,
    isActive: true,
    status: "APPROVED",
    reviewer: "Alice Johnson",
    reviewedDate: "2024-01-20",
    applications: 12,
  },
  {
    id: "2",
    title: "Leadership & Communication Skills",
    description: "Develop essential soft skills for leadership roles in corporate environment",
    companyName: "Leadership Academy",
    stack: "Soft Skills",
    category: "SOFT_SKILLS",
    type: "CORPORATE",
    location: "Mumbai, Maharashtra",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    paymentAmount: 35000,
    paymentTerm: 15,
    isPublished: true,
    isActive: false,
    status: "PENDING",
    reviewer: null,
    reviewedDate: null,
    applications: 8,
  },
  {
    id: "3",
    title: "Python Fundamentals Course",
    description: "Comprehensive Python programming course for beginners and intermediate learners",
    companyName: "Code University",
    stack: "Python",
    category: "FUNDAMENTALS",
    type: "UNIVERSITY",
    location: "Delhi, Delhi",
    startDate: "2024-02-20",
    endDate: "2024-03-20",
    paymentAmount: 75000,
    paymentTerm: 45,
    isPublished: false,
    isActive: true,
    status: "REJECTED",
    reviewer: "Bob Smith",
    reviewedDate: "2024-01-19",
    applications: 25,
  },
  {
    id: "4",
    title: "Node.js Backend Development",
    description: "Master backend development with Node.js, Express, and MongoDB",
    companyName: "DevWorks Inc.",
    stack: "Node.js",
    category: "FRAMEWORKS",
    type: "CORPORATE",
    location: "Pune, Maharashtra",
    startDate: "2024-02-25",
    endDate: "2024-03-05",
    paymentAmount: 60000,
    paymentTerm: 30,
    isPublished: true,
    isActive: true,
    status: "APPROVED",
    reviewer: "Carol Davis",
    reviewedDate: "2024-01-18",
    applications: 15,
  },
  {
    id: "5",
    title: "Data Science with R",
    description: "Complete data science course using R programming language",
    companyName: "Data Science Institute",
    stack: "R",
    category: "FUNDAMENTALS",
    type: "UNIVERSITY",
    location: "Chennai, Tamil Nadu",
    startDate: "2024-03-01",
    endDate: "2024-04-01",
    paymentAmount: 80000,
    paymentTerm: 60,
    isPublished: false,
    isActive: true,
    status: "PENDING",
    reviewer: null,
    reviewedDate: null,
    applications: 18,
  },
]

const statusColors = {
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

export default function MaintainerTrainingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComments, setReviewComments] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (status === "authenticated" && session?.user?.role !== "MAINTAINER") {
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

  if (!session || session.user.role !== "MAINTAINER") {
    return null
  }

  const user = session.user

  const filteredTrainings = dummyTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || training.status === statusFilter
    const matchesCategory = categoryFilter === "ALL" || training.category === categoryFilter
    const matchesType = typeFilter === "ALL" || training.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesCategory && matchesType
  })

  const handleReview = (training) => {
    setSelectedTraining(training)
    setReviewDecision("")
    setReviewComments("")
    setIsReviewDialogOpen(true)
  }

  const submitReview = () => {
    // Submit review logic would go here
    console.log("Submitting training review:", {
      trainingId: selectedTraining.id,
      decision: reviewDecision,
      comments: reviewComments,
    })
    setIsReviewDialogOpen(false)
    setSelectedTraining(null)
    setReviewDecision("")
    setReviewComments("")
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />
    }
  }

  const togglePublishStatus = (trainingId, currentStatus) => {
    // Toggle publish status logic would go here
    console.log("Toggling publish status for training:", trainingId, "to", !currentStatus)
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name || user.email || "Maintainer"}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Review and manage platform trainings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            My Reviews
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.filter(t => t.status === "PENDING").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.filter(t => t.isPublished).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.reduce((sum, t) => sum + t.applications, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Trainings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="SOFT_SKILLS">Soft Skills</SelectItem>
                <SelectItem value="FUNDAMENTALS">Fundamentals</SelectItem>
                <SelectItem value="FRAMEWORKS">Frameworks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CORPORATE">Corporate</SelectItem>
                <SelectItem value="UNIVERSITY">University</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Training Reviews</CardTitle>
          <CardDescription>Review and manage training postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>{training.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{training.category}</Badge>
                    </TableCell>
                    <TableCell>{training.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{training.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{training.paymentAmount.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(training.status)}
                        <Badge className={statusColors[training.status]}>
                          {training.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{training.applications}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {training.status === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleReview(training)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => togglePublishStatus(training.id, training.isPublished)}>
                            {training.isPublished ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Training
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Training: {selectedTraining?.title}</DialogTitle>
            <DialogDescription>
              Review and approve/reject this training posting
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Organization</Label>
                <p className="text-sm text-muted-foreground">{selectedTraining?.companyName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm text-muted-foreground">{selectedTraining?.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-muted-foreground">{selectedTraining?.type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">{selectedTraining?.location}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment</Label>
                <p className="text-sm text-muted-foreground">₹{selectedTraining?.paymentAmount?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Duration</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTraining?.startDate && selectedTraining?.endDate && 
                    `${format(new Date(selectedTraining.startDate), "MMM dd")} - ${format(new Date(selectedTraining.endDate), "MMM dd")}`
                  }
                </p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-muted-foreground mt-1">{selectedTraining?.description}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="decision" className="text-right">
                Decision
              </Label>
              <Select value={reviewDecision} onValueChange={setReviewDecision}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approve</SelectItem>
                  <SelectItem value="REJECTED">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comments" className="text-right">
                Comments
              </Label>
              <Textarea
                id="comments"
                placeholder="Provide comments for your decision..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={!reviewDecision}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}