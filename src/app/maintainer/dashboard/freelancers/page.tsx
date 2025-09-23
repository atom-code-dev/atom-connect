"use client"

import { useState } from "react"
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

// Dummy data for maintainer freelancers
const dummyFreelancers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    skills: ["React.js", "Node.js", "TypeScript", "MongoDB"],
    trainerType: "CORPORATE",
    experience: "5+ years of experience in full-stack development with expertise in React and Node.js",
    linkedinProfile: "https://linkedin.com/in/johndoe",
    availability: "AVAILABLE",
    location: "Bangalore, Karnataka",
    rating: 4.8,
    completedTrainings: 25,
    status: "APPROVED",
    reviewer: "Alice Johnson",
    reviewedDate: "2024-01-20",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91-9876543211",
    skills: ["Python", "Django", "Machine Learning", "Data Science"],
    trainerType: "UNIVERSITY",
    experience: "8+ years of experience in data science and machine learning",
    linkedinProfile: "https://linkedin.com/in/janesmith",
    availability: "IN_TRAINING",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    completedTrainings: 40,
    status: "PENDING",
    reviewer: null,
    reviewedDate: null,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91-9876543212",
    skills: ["Leadership", "Communication", "Team Building", "Project Management"],
    trainerType: "CORPORATE",
    experience: "10+ years of experience in corporate training and leadership development",
    linkedinProfile: "https://linkedin.com/in/bobjohnson",
    availability: "AVAILABLE",
    location: "Delhi, Delhi",
    rating: 4.7,
    completedTrainings: 60,
    status: "REJECTED",
    reviewer: "Bob Smith",
    reviewedDate: "2024-01-19",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+91-9876543213",
    skills: ["Java", "Spring Boot", "Microservices", "AWS"],
    trainerType: "BOTH",
    experience: "6+ years of experience in enterprise Java development and cloud architecture",
    linkedinProfile: "https://linkedin.com/in/alicebrown",
    availability: "NOT_AVAILABLE",
    location: "Pune, Maharashtra",
    rating: 4.6,
    completedTrainings: 30,
    status: "APPROVED",
    reviewer: "Carol Davis",
    reviewedDate: "2024-01-18",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    phone: "+91-9876543214",
    skills: ["Angular", "TypeScript", "RxJS", "NgRx"],
    trainerType: "CORPORATE",
    experience: "4+ years of experience in frontend development with Angular",
    linkedinProfile: "https://linkedin.com/in/charliewilson",
    availability: "AVAILABLE",
    location: "Chennai, Tamil Nadu",
    rating: 4.5,
    completedTrainings: 18,
    status: "PENDING",
    reviewer: null,
    reviewedDate: null,
  },
]

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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")
  const [trainerTypeFilter, setTrainerTypeFilter] = useState("ALL")
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComments, setReviewComments] = useState("")

  const filteredFreelancers = dummyFreelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "ALL" || freelancer.status === statusFilter
    const matchesAvailability = availabilityFilter === "ALL" || freelancer.availability === availabilityFilter
    const matchesTrainerType = trainerTypeFilter === "ALL" || freelancer.trainerType === trainerTypeFilter
    
    return matchesSearch && matchesStatus && matchesAvailability && matchesTrainerType
  })

  const handleReview = (freelancer) => {
    setSelectedFreelancer(freelancer)
    setReviewDecision("")
    setReviewComments("")
    setIsReviewDialogOpen(true)
  }

  const submitReview = () => {
    // Submit review logic would go here
    console.log("Submitting freelancer review:", {
      freelancerId: selectedFreelancer.id,
      decision: reviewDecision,
      comments: reviewComments,
    })
    setIsReviewDialogOpen(false)
    setSelectedFreelancer(null)
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

  const toggleAccountStatus = (freelancerId, currentStatus) => {
    // Toggle account status logic would go here
    console.log("Toggling account status for freelancer:", freelancerId, "to", currentStatus === "APPROVED" ? "REJECTED" : "APPROVED")
  }

  return (
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
            <div className="text-2xl font-bold">{dummyFreelancers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyFreelancers.filter(f => f.status === "PENDING").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyFreelancers.filter(f => f.availability === "AVAILABLE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dummyFreelancers.reduce((sum, f) => sum + f.rating, 0) / dummyFreelancers.length).toFixed(1)}
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
                        {getStatusIcon(freelancer.status)}
                        <Badge className={statusColors[freelancer.status]}>
                          {freelancer.status}
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
                          {freelancer.status === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleReview(freelancer)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review
                            </DropdownMenuItem>
                          )}
                          {freelancer.status === "APPROVED" ? (
                            <DropdownMenuItem onClick={() => toggleAccountStatus(freelancer.id, freelancer.status)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Disable Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleAccountStatus(freelancer.id, freelancer.status)}>
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
  )
}