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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, Building, Users, AlertTriangle, Star } from "lucide-react"

// Dummy data for maintainer organizations
const dummyOrganizations = [
  {
    id: "1",
    name: "TechCorp Solutions",
    email: "contact@techcorp.com",
    website: "https://techcorp.com",
    phone: "+91-9876543210",
    location: "Bangalore, Karnataka",
    verifiedStatus: "VERIFIED",
    activeStatus: "ACTIVE",
    ratings: 4.5,
    trainingsCount: 12,
    joinDate: "2024-01-15",
    reviewer: "Alice Johnson",
    reviewedDate: "2024-01-20",
  },
  {
    id: "2",
    name: "Code Academy",
    email: "info@codeacademy.com",
    website: "https://codeacademy.com",
    phone: "+91-9876543211",
    location: "Mumbai, Maharashtra",
    verifiedStatus: "PENDING",
    activeStatus: "ACTIVE",
    ratings: 4.2,
    trainingsCount: 8,
    joinDate: "2024-01-10",
    reviewer: null,
    reviewedDate: null,
  },
  {
    id: "3",
    name: "Innovation Labs",
    email: "hello@innovationlabs.com",
    website: "https://innovationlabs.com",
    phone: "+91-9876543212",
    location: "Delhi, Delhi",
    verifiedStatus: "REJECTED",
    activeStatus: "INACTIVE",
    ratings: 3.5,
    trainingsCount: 3,
    joinDate: "2024-01-08",
    reviewer: "Bob Smith",
    reviewedDate: "2024-01-12",
  },
  {
    id: "4",
    name: "Data Science Hub",
    email: "info@datasciencehub.com",
    website: "https://datasciencehub.com",
    phone: "+91-9876543213",
    location: "Chennai, Tamil Nadu",
    verifiedStatus: "VERIFIED",
    activeStatus: "ACTIVE",
    ratings: 4.6,
    trainingsCount: 10,
    joinDate: "2024-01-18",
    reviewer: "Carol Davis",
    reviewedDate: "2024-01-19",
  },
  {
    id: "5",
    name: "Leadership Institute",
    email: "contact@leadership.edu",
    website: "https://leadership.edu",
    phone: "+91-9876543214",
    location: "Pune, Maharashtra",
    verifiedStatus: "PENDING",
    activeStatus: "ACTIVE",
    ratings: 4.8,
    trainingsCount: 15,
    joinDate: "2024-01-20",
    reviewer: null,
    reviewedDate: null,
  },
]

const verificationStatusColors = {
  VERIFIED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  REJECTED: "bg-red-100 text-red-800",
}

const activeStatusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
}

export default function MaintainerOrganizationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("ALL")
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null)
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

  const filteredOrganizations = dummyOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVerification = verificationFilter === "ALL" || org.verifiedStatus === verificationFilter
    const matchesActive = activeFilter === "ALL" || org.activeStatus === activeFilter
    
    return matchesSearch && matchesVerification && matchesActive
  })

  const handleReview = (organization) => {
    setSelectedOrganization(organization)
    setReviewDecision("")
    setReviewComments("")
    setIsReviewDialogOpen(true)
  }

  const submitReview = () => {
    // Submit review logic would go here
    console.log("Submitting organization review:", {
      organizationId: selectedOrganization.id,
      decision: reviewDecision,
      comments: reviewComments,
    })
    setIsReviewDialogOpen(false)
    setSelectedOrganization(null)
    setReviewDecision("")
    setReviewComments("")
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "VERIFIED":
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
      case "INACTIVE":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const toggleActiveStatus = (organizationId, currentStatus) => {
    // Toggle active status logic would go here
    console.log("Toggling active status for organization:", organizationId, "to", currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE")
  }

  return (
    <DashboardLayout userRole={session.user?.role || ""} userName={session.user?.name || ""}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations Management</h1>
          <p className="text-muted-foreground">Review and manage organization verifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Building className="h-4 w-4 mr-2" />
            My Reviews
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyOrganizations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyOrganizations.filter(o => o.verifiedStatus === "PENDING").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyOrganizations.filter(o => o.verifiedStatus === "VERIFIED").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyOrganizations.reduce((sum, org) => sum + org.trainingsCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Active Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Reviews</CardTitle>
          <CardDescription>Review and manage organization verifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Trainings</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {org.name}
                      </div>
                    </TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{org.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(org.verifiedStatus)}
                        <Badge className={verificationStatusColors[org.verifiedStatus]}>
                          {org.verifiedStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(org.activeStatus)}
                        <Badge className={activeStatusColors[org.activeStatus]}>
                          {org.activeStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{org.ratings}</span>
                      </div>
                    </TableCell>
                    <TableCell>{org.trainingsCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Building className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {org.verifiedStatus === "PENDING" && (
                            <DropdownMenuItem onClick={() => handleReview(org)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review
                            </DropdownMenuItem>
                          )}
                          {org.activeStatus === "ACTIVE" ? (
                            <DropdownMenuItem onClick={() => toggleActiveStatus(org.id, org.activeStatus)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleActiveStatus(org.id, org.activeStatus)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Organization: {selectedOrganization?.name}</DialogTitle>
            <DialogDescription>
              Review and approve/reject this organization verification
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{selectedOrganization?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Phone</Label>
                <p className="text-sm text-muted-foreground">{selectedOrganization?.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Website</Label>
                <p className="text-sm text-muted-foreground">{selectedOrganization?.website}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">{selectedOrganization?.location}</p>
              </div>
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
                  <SelectItem value="VERIFIED">Approve</SelectItem>
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