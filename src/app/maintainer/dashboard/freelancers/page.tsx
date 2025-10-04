"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Users, AlertTriangle, Star, MapPin, Briefcase } from "lucide-react"

interface Freelancer {
  id: string
  name: string
  email: string
  phone?: string
  skills: string[]
  trainerType: "CORPORATE" | "UNIVERSITY" | "BOTH"
  experience: string
  linkedinProfile?: string
  availability: "AVAILABLE" | "IN_TRAINING" | "NOT_AVAILABLE"
  location: string
  rating: number
  completedTrainings: number
  profileCompleted: boolean
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

interface FreelancersResponse {
  freelancers: Freelancer[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MaintainerFreelancersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")
  const [trainerTypeFilter, setTrainerTypeFilter] = useState("ALL")
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComments, setReviewComments] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

const statusColors = {
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

const availabilityColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  IN_TRAINING: "bg-yellow-100 text-yellow-800",
  NOT_AVAILABLE: "bg-red-100 text-red-800",
}

const trainerTypeColors = {
  CORPORATE: "bg-blue-100 text-blue-800",
  UNIVERSITY: "bg-purple-100 text-purple-800",
  BOTH: "bg-orange-100 text-orange-800",
}

export default function MaintainerFreelancersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")
  const [trainerTypeFilter, setTrainerTypeFilter] = useState("ALL")
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComments, setReviewComments] = useState("")

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

    fetchFreelancers()
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchFreelancers()
    }
  }, [searchTerm, statusFilter, availabilityFilter, trainerTypeFilter, pagination.page])

  const fetchFreelancers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        trainerType: trainerTypeFilter === "ALL" ? "" : trainerTypeFilter,
        availability: availabilityFilter === "ALL" ? "" : availabilityFilter,
      })

      const response = await fetch(`/api/freelancers?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch freelancers")
      }
      
      const data: FreelancersResponse = await response.json()
      setFreelancers(data.freelancers)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching freelancers:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const filteredFreelancers = freelancers

  const handleReview = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer)
    setReviewDecision("")
    setReviewComments("")
    setIsReviewDialogOpen(true)
  }

  const submitReview = async () => {
    if (!selectedFreelancer || !reviewDecision) return

    try {
      const action = reviewDecision === "APPROVED" ? "activate" : "deactivate"
      const response = await fetch("/api/freelancers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerIds: [selectedFreelancer.id],
          action,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit review")
      }

      setIsReviewDialogOpen(false)
      setSelectedFreelancer(null)
      setReviewDecision("")
      setReviewComments("")
      
      // Refresh the freelancers list
      fetchFreelancers()
    } catch (err) {
      console.error("Error submitting review:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const getStatusIcon = (status: string) => {
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

  const toggleAccountStatus = async (freelancerId: string, currentStatus: string) => {
    try {
      const action = currentStatus === "APPROVED" ? "deactivate" : "activate"
      const response = await fetch("/api/freelancers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          freelancerIds: [freelancerId],
          action,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle account status")
      }

      // Refresh the freelancers list
      fetchFreelancers()
    } catch (err) {
      console.error("Error toggling account status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const getFreelancerStatus = (freelancer: Freelancer) => {
    // For freelancers, we'll use profileCompleted to determine status
    return freelancer.profileCompleted ? "APPROVED" : "PENDING"
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchFreelancers}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole={session.user?.role || ""} userName={session.user?.name || ""}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Freelancers Management</h1>
            <p className="text-muted-foreground">Review and manage freelancer profiles</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              My Reviews
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freelancers.filter(f => !f.profileCompleted).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{freelancers.filter(f => f.availability === "AVAILABLE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(freelancers.reduce((sum, f) => sum + f.rating, 0) / freelancers.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Freelancers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search freelancers..."
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
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Availability</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="IN_TRAINING">In Training</SelectItem>
                <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trainerTypeFilter} onValueChange={setTrainerTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trainer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CORPORATE">Corporate</SelectItem>
                <SelectItem value="UNIVERSITY">University</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Freelancers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Reviews</CardTitle>
          <CardDescription>Review and manage freelancer profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFreelancers.map((freelancer) => (
                  <TableRow key={freelancer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {freelancer.name}
                      </div>
                    </TableCell>
                    <TableCell>{freelancer.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 2).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={trainerTypeColors[freelancer.trainerType]}>
                        {freelancer.trainerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{freelancer.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(getFreelancerStatus(freelancer))}
                        <Badge className={statusColors[getFreelancerStatus(freelancer)]}>
                          {getFreelancerStatus(freelancer)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{freelancer.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Users className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!freelancer.profileCompleted && (
                            <DropdownMenuItem onClick={() => handleReview(freelancer)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review
                            </DropdownMenuItem>
                          )}
                          {freelancer.profileCompleted ? (
                            <DropdownMenuItem onClick={() => toggleAccountStatus(freelancer.id, getFreelancerStatus(freelancer))}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Disable Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleAccountStatus(freelancer.id, getFreelancerStatus(freelancer))}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enable Account
                            </DropdownMenuItem>
                          )}
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
            <DialogTitle>Review Freelancer: {selectedFreelancer?.name}</DialogTitle>
            <DialogDescription>
              Review and approve/reject this freelancer profile
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{selectedFreelancer?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-muted-foreground">{selectedFreelancer?.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Trainer Type</Label>
                <Badge className={trainerTypeColors[selectedFreelancer?.trainerType]}>
                  {selectedFreelancer?.trainerType}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">{selectedFreelancer?.location}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedFreelancer?.skills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Experience</Label>
              <p className="text-sm text-muted-foreground mt-1">{selectedFreelancer?.experience}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">LinkedIn Profile</Label>
              <a href={selectedFreelancer?.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                {selectedFreelancer?.linkedinProfile}
              </a>
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
}
