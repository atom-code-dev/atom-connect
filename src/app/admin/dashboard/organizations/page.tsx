"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Building, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { VerificationStatus, ActiveStatus } from "@prisma/client"

interface OrganizationProfile {
  id: string
  organizationName: string
  website?: string
  contactMail: string
  phone?: string
  verifiedStatus: VerificationStatus
  companyLocation: string
  activeStatus: ActiveStatus
  ratings: number
  logo?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    name?: string
  }
  trainings: any[]
  feedbacks: any[]
}

interface User {
  id: string
  email: string
  role: string
  name: string
}

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

  const [organizations, setOrganizations] = useState<OrganizationProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [verificationFilter, setVerificationFilter] = useState("ALL")
  const [activeFilter, setActiveFilter] = useState("ALL")
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        search: searchTerm,
        verificationStatus: verificationFilter === "ALL" ? "" : verificationFilter,
        activeStatus: activeFilter === "ALL" ? "" : activeFilter,
      })
      
      const response = await fetch(`/api/organizations?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch organizations')
      }
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
      toast.error('Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, verificationFilter, activeFilter])

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

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchOrganizations()
    }
  }, [status, session, fetchOrganizations])

  const handleExportCSV = useCallback(() => {
    if (selectedOrganizations.length === 0) {
      toast.error("Please select organizations to export")
      return
    }

    const organizationsToExport = organizations.filter(org => selectedOrganizations.includes(org.id))
    
    // Create CSV content
    const headers = ["Organization Name", "Email", "Website", "Location", "Verification Status", "Active Status", "Rating", "Join Date"]
    const csvContent = [
      headers.join(","),
      ...organizationsToExport.map(org => [
        org.organizationName,
        org.contactMail,
        org.website || '',
        org.companyLocation,
        org.verifiedStatus,
        org.activeStatus,
        org.ratings,
        new Date(org.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `organizations_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${organizationsToExport.length} organizations to CSV`)
  }, [selectedOrganizations, organizations])

  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      const matchesSearch = searchTerm === "" || 
                           org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.contactMail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.companyLocation.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesVerification = verificationFilter === "ALL" || org.verifiedStatus === verificationFilter
      const matchesActive = activeFilter === "ALL" || org.activeStatus === activeFilter
      
      return matchesSearch && matchesVerification && matchesActive
    })
  }, [organizations, searchTerm, verificationFilter, activeFilter])

  if (status === "loading" || !session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const user = session.user

  const handleSelectOrganization = (orgId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrganizations(prev => [...prev, orgId])
    } else {
      setSelectedOrganizations(prev => prev.filter(id => id !== orgId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedOrganizations(filteredOrganizations.map(org => org.id))
    } else {
      setSelectedOrganizations([])
    }
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
          {selectedOrganizations.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedOrganizations.length} selected
            </Badge>
          )}
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
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{organizations.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{organizations.filter(o => o.verifiedStatus === 'VERIFIED').length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{organizations.filter(o => o.verifiedStatus === 'PENDING').length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{organizations.reduce((sum, org) => sum + org.trainings.length, 0)}</div>
            )}
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
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isSelectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all organizations"
                    />
                  </TableHead>
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredOrganizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrganizations.includes(org.id)}
                          onCheckedChange={(checked) => handleSelectOrganization(org.id, checked as boolean)}
                          aria-label={`Select ${org.organizationName}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {org.organizationName}
                        </div>
                      </TableCell>
                      <TableCell>{org.contactMail}</TableCell>
                      <TableCell>{org.companyLocation}</TableCell>
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
                      <TableCell>{org.trainings.length}</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {!loading && filteredOrganizations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No organizations found matching your filters.
            </div>
          )}
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