"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Building, CheckCircle, XCircle, Clock } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  name: string
}

// Dummy data for organizations
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
  },
  {
    id: "3",
    name: "Leadership Institute",
    email: "hello@leadership.edu",
    website: "https://leadership.edu",
    phone: "+91-9876543212",
    location: "Delhi, Delhi",
    verifiedStatus: "VERIFIED",
    activeStatus: "ACTIVE",
    ratings: 4.8,
    trainingsCount: 15,
    joinDate: "2024-01-08",
  },
  {
    id: "4",
    name: "DevWorks Inc.",
    email: "contact@devworks.com",
    website: "https://devworks.com",
    phone: "+91-9876543213",
    location: "Pune, Maharashtra",
    verifiedStatus: "REJECTED",
    activeStatus: "INACTIVE",
    ratings: 3.5,
    trainingsCount: 3,
    joinDate: "2024-01-05",
  },
  {
    id: "5",
    name: "Data Science Hub",
    email: "info@datasciencehub.com",
    website: "https://datasciencehub.com",
    phone: "+91-9876543214",
    location: "Chennai, Tamil Nadu",
    verifiedStatus: "VERIFIED",
    activeStatus: "ACTIVE",
    ratings: 4.6,
    trainingsCount: 10,
    joinDate: "2024-01-18",
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

export default function AdminOrganizationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("ALL")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
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

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const user = session.user

  const filteredOrganizations = dummyOrganizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVerification = verificationFilter === "ALL" || org.verifiedStatus === verificationFilter
    const matchesActive = activeFilter === "ALL" || org.activeStatus === activeFilter
    
    return matchesSearch && matchesVerification && matchesActive
  })

  const handleExportCSV = () => {
    // CSV export logic would go here
    console.log("Exporting organizations to CSV...")
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name || "Admin"}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations Management</h1>
          <p className="text-muted-foreground">Manage all organizations in the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button>Add Organization</Button>
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
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyOrganizations.filter(o => o.verifiedStatus === "VERIFIED").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyOrganizations.filter(o => o.verifiedStatus === "PENDING").length}</div>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
          <CardTitle>Organizations List</CardTitle>
          <CardDescription>Manage and view all organizations in the system</CardDescription>
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
                      <Badge className={verificationStatusColors[org.verifiedStatus]}>
                        {org.verifiedStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={activeStatusColors[org.activeStatus]}>
                        {org.activeStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span>{org.ratings}</span>
                      </div>
                    </TableCell>
                    <TableCell>{org.trainingsCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Organization
                          </DropdownMenuItem>
                          {org.verifiedStatus === "PENDING" && (
                            <>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {org.activeStatus === "ACTIVE" ? (
                            <DropdownMenuItem>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
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

      {/* Detailed Organization View */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Click on an organization to view detailed information</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="trainings">Training Activity</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                Select an organization to view profile details
              </div>
            </TabsContent>
            <TabsContent value="trainings" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                Select an organization to view training activity
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                Select an organization to view analytics
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}