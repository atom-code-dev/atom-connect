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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Building, Users, BookOpen, AlertTriangle, Star } from "lucide-react"

export default function MaintainerReviewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/")
      return
    }
    
    if (session.user?.role !== "MAINTAINER") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

// Dummy data for reviews
const dummyReviews = {
  organizations: [
    {
      id: "1",
      name: "TechCorp Solutions",
      type: "organization",
      submittedBy: "contact@techcorp.com",
      submittedDate: "2024-01-20",
      status: "PENDING",
      priority: "HIGH",
      documents: ["Business Registration", "Tax ID", "Address Proof"],
      reviewer: null,
      reviewedDate: null,
    },
    {
      id: "2",
      name: "Code Academy",
      type: "organization",
      submittedBy: "info@codeacademy.com",
      submittedDate: "2024-01-19",
      status: "APPROVED",
      priority: "MEDIUM",
      documents: ["Business Registration", "Tax ID"],
      reviewer: "Alice Johnson",
      reviewedDate: "2024-01-20",
    },
    {
      id: "3",
      name: "Innovation Labs",
      type: "organization",
      submittedBy: "hello@innovationlabs.com",
      submittedDate: "2024-01-18",
      status: "REJECTED",
      priority: "HIGH",
      documents: ["Business Registration"],
      reviewer: "Bob Smith",
      reviewedDate: "2024-01-19",
    },
  ],
  trainings: [
    {
      id: "1",
      title: "React.js Advanced Training",
      type: "training",
      submittedBy: "TechCorp Solutions",
      submittedDate: "2024-01-20",
      status: "PENDING",
      priority: "MEDIUM",
      category: "FRAMEWORKS",
      reviewer: null,
      reviewedDate: null,
    },
    {
      id: "2",
      title: "Python Fundamentals Course",
      type: "training",
      submittedBy: "Code University",
      submittedDate: "2024-01-19",
      status: "APPROVED",
      priority: "HIGH",
      category: "FUNDAMENTALS",
      reviewer: "Carol Davis",
      reviewedDate: "2024-01-20",
    },
    {
      id: "3",
      title: "Leadership Skills Workshop",
      type: "training",
      submittedBy: "Leadership Institute",
      submittedDate: "2024-01-18",
      status: "REJECTED",
      priority: "LOW",
      category: "SOFT_SKILLS",
      reviewer: "David Wilson",
      reviewedDate: "2024-01-19",
    },
  ],
  freelancers: [
    {
      id: "1",
      name: "John Doe",
      type: "freelancer",
      submittedBy: "john@example.com",
      submittedDate: "2024-01-20",
      status: "PENDING",
      priority: "MEDIUM",
      skills: ["React.js", "Node.js", "TypeScript"],
      experience: "5+ years",
      reviewer: null,
      reviewedDate: null,
    },
    {
      id: "2",
      name: "Jane Smith",
      type: "freelancer",
      submittedBy: "jane@example.com",
      submittedDate: "2024-01-19",
      status: "APPROVED",
      priority: "HIGH",
      skills: ["Python", "Machine Learning"],
      experience: "8+ years",
      reviewer: "Alice Johnson",
      reviewedDate: "2024-01-20",
    },
    {
      id: "3",
      name: "Bob Johnson",
      type: "freelancer",
      submittedBy: "bob@example.com",
      submittedDate: "2024-01-18",
      status: "REJECTED",
      priority: "LOW",
      skills: ["JavaScript"],
      experience: "2+ years",
      reviewer: "Bob Smith",
      reviewedDate: "2024-01-19",
    },
  ],
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

const priorityColors = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
}

export default function MaintainerReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [activeTab, setActiveTab] = useState("organizations")
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComments, setReviewComments] = useState("")

  const getFilteredReviews = (reviews) => {
    return reviews.filter(review => {
      const matchesSearch = (review.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                           (review.submittedBy?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || review.status === statusFilter
      const matchesPriority = priorityFilter === "ALL" || review.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }

  const handleReview = (review) => {
    setSelectedReview(review)
    setReviewDecision("")
    setReviewComments("")
    setIsReviewDialogOpen(true)
  }

  const submitReview = () => {
    // Submit review logic would go here
    console.log("Submitting review:", {
      reviewId: selectedReview.id,
      decision: reviewDecision,
      comments: reviewComments,
    })
    setIsReviewDialogOpen(false)
    setSelectedReview(null)
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
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "organization":
        return <Building className="h-4 w-4" />
      case "training":
        return <BookOpen className="h-4 w-4" />
      case "freelancer":
        return <Users className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout userRole={session.user?.role || ""} userName={session.user?.name || ""}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Review Management</h1>
          <p className="text-muted-foreground">Review and approve organizations, trainings, and freelancers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Star className="h-4 w-4 mr-2" />
            My Reviews
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dummyReviews.organizations.length + dummyReviews.trainings.length + dummyReviews.freelancers.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                ...dummyReviews.organizations,
                ...dummyReviews.trainings,
                ...dummyReviews.freelancers
              ].filter(r => r.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                ...dummyReviews.organizations,
                ...dummyReviews.trainings,
                ...dummyReviews.freelancers
              ].filter(r => r.status === "APPROVED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[
                ...dummyReviews.organizations,
                ...dummyReviews.trainings,
                ...dummyReviews.freelancers
              ].filter(r => r.priority === "HIGH").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Priority</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>Items pending your review</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="organizations">
                Organizations ({dummyReviews.organizations.filter(r => r.status === "PENDING").length})
              </TabsTrigger>
              <TabsTrigger value="trainings">
                Trainings ({dummyReviews.trainings.filter(r => r.status === "PENDING").length})
              </TabsTrigger>
              <TabsTrigger value="freelancers">
                Freelancers ({dummyReviews.freelancers.filter(r => r.status === "PENDING").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="organizations" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredReviews(dummyReviews.organizations).map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(review.type)}
                            {review.name}
                          </div>
                        </TableCell>
                        <TableCell>{review.submittedBy}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {review.documents.slice(0, 2).map(doc => (
                              <Badge key={doc} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                            {review.documents.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{review.documents.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(review.status)}
                            <Badge className={statusColors[review.status]}>
                              {review.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[review.priority]}>
                            {review.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(review.submittedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleReview(review)}>
                              {review.status === "PENDING" ? "Review" : "View"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="trainings" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Training</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredReviews(dummyReviews.trainings).map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(review.type)}
                            {review.title}
                          </div>
                        </TableCell>
                        <TableCell>{review.submittedBy}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{review.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(review.status)}
                            <Badge className={statusColors[review.status]}>
                              {review.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[review.priority]}>
                            {review.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(review.submittedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleReview(review)}>
                              {review.status === "PENDING" ? "Review" : "View"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="freelancers" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Freelancer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredReviews(dummyReviews.freelancers).map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(review.type)}
                            {review.name}
                          </div>
                        </TableCell>
                        <TableCell>{review.submittedBy}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {review.skills.slice(0, 2).map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {review.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{review.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(review.status)}
                            <Badge className={statusColors[review.status]}>
                              {review.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[review.priority]}>
                            {review.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(review.submittedDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => handleReview(review)}>
                              {review.status === "PENDING" ? "Review" : "View"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review {selectedReview?.name}</DialogTitle>
            <DialogDescription>
              Review and approve/reject this {selectedReview?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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