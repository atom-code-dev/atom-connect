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
import HexagonLoader from "@/components/ui/hexagon-loader"
import { toast } from "sonner"
import { VerificationStatus, ActiveStatus } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationProfile | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    organizationName: "",
    website: "",
    contactMail: "",
    phone: "",
    companyLocation: "",
    logo: ""
  })
  const [addForm, setAddForm] = useState({
    email: "",
    password: "",
    name: "",
    organizationName: "",
    website: "",
    contactMail: "",
    phone: "",
    companyLocation: "",
    logo: ""
  })

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

  const handleViewDetails = async (org: OrganizationProfile) => {
    try {
      const response = await fetch(`/api/organizations/${org.id}`)
      if (response.ok) {
        const detailedOrg = await response.json()
        setSelectedOrganization(detailedOrg)
        setIsViewDialogOpen(true)
      } else {
        toast.error('Failed to fetch organization details')
      }
    } catch (error) {
      console.error('Error fetching organization details:', error)
      toast.error('Failed to fetch organization details')
    }
  }

  const handleEditOrganization = (org: OrganizationProfile) => {
    setSelectedOrganization(org)
    setEditForm({
      organizationName: org.organizationName,
      website: org.website || "",
      contactMail: org.contactMail,
      phone: org.phone || "",
      companyLocation: org.companyLocation,
      logo: org.logo || ""
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrganization = async () => {
    if (!selectedOrganization) return

    try {
      const response = await fetch(`/api/organizations/${selectedOrganization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          ...editForm
        })
      })

      if (response.ok) {
        const updatedOrg = await response.json()
        setOrganizations(prev => prev.map(org => 
          org.id === updatedOrg.id ? updatedOrg : org
        ))
        setIsEditDialogOpen(false)
        toast.success('Organization updated successfully')
      } else {
        toast.error('Failed to update organization')
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      toast.error('Failed to update organization')
    }
  }

  const handleApproveOrganization = async (org: OrganizationProfile) => {
    try {
      const response = await fetch(`/api/organizations/${org.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' })
      })

      if (response.ok) {
        const updatedOrg = await response.json()
        setOrganizations(prev => prev.map(o => 
          o.id === updatedOrg.id ? updatedOrg : o
        ))
        toast.success('Organization approved successfully')
      } else {
        toast.error('Failed to approve organization')
      }
    } catch (error) {
      console.error('Error approving organization:', error)
      toast.error('Failed to approve organization')
    }
  }

  const handleRejectOrganization = async (org: OrganizationProfile) => {
    try {
      const response = await fetch(`/api/organizations/${org.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' })
      })

      if (response.ok) {
        const updatedOrg = await response.json()
        setOrganizations(prev => prev.map(o => 
          o.id === updatedOrg.id ? updatedOrg : o
        ))
        toast.success('Organization rejected successfully')
      } else {
        toast.error('Failed to reject organization')
      }
    } catch (error) {
      console.error('Error rejecting organization:', error)
      toast.error('Failed to reject organization')
    }
  }

  const handleToggleActiveStatus = async (org: OrganizationProfile) => {
    try {
      const action = org.activeStatus === 'ACTIVE' ? 'deactivate' : 'activate'
      const response = await fetch(`/api/organizations/${org.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const updatedOrg = await response.json()
        setOrganizations(prev => prev.map(o => 
          o.id === updatedOrg.id ? updatedOrg : o
        ))
        const actionText = action === 'activate' ? 'activated' : 'deactivated'
        toast.success(`Organization ${actionText} successfully`)
      } else {
        toast.error(`Failed to ${action} organization`)
      }
    } catch (error) {
      console.error('Error toggling organization status:', error)
      toast.error('Failed to update organization status')
    }
  }

  const handleDeleteOrganization = async (org: OrganizationProfile) => {
    setSelectedOrganization(org)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteOrganization = async () => {
    if (!selectedOrganization) return

    try {
      const response = await fetch(`/api/organizations/${selectedOrganization.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setOrganizations(prev => prev.filter(org => org.id !== selectedOrganization.id))
        setIsDeleteDialogOpen(false)
        toast.success('Organization deleted successfully')
      } else {
        toast.error('Failed to delete organization')
      }
    } catch (error) {
      console.error('Error deleting organization:', error)
      toast.error('Failed to delete organization')
    }
  }

  const handleAddOrganization = async () => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm)
      })

      if (response.ok) {
        const newOrganization = await response.json()
        setOrganizations(prev => [newOrganization, ...prev])
        setIsAddDialogOpen(false)
        setAddForm({
          email: "",
          password: "",
          name: "",
          organizationName: "",
          website: "",
          contactMail: "",
          phone: "",
          companyLocation: "",
          logo: ""
        })
        toast.success('Organization created successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to create organization')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Failed to create organization')
    }
  }

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
          <HexagonLoader size={64} className="mx-auto mb-4" />
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
          <Button onClick={() => setIsAddDialogOpen(true)}>Add Organization</Button>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(org)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditOrganization(org)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Organization
                            </DropdownMenuItem>
                            {org.verifiedStatus === "PENDING" && (
                              <>
                                <DropdownMenuItem onClick={() => handleApproveOrganization(org)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRejectOrganization(org)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {org.activeStatus === "ACTIVE" ? (
                              <DropdownMenuItem onClick={() => handleToggleActiveStatus(org)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleToggleActiveStatus(org)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteOrganization(org)}>
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

      {/* View Organization Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organization Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedOrganization?.organizationName}
            </DialogDescription>
          </DialogHeader>
          {selectedOrganization && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Organization Name</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization.organizationName}</p>
                </div>
                <div>
                  <Label className="font-semibold">Contact Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization.contactMail}</p>
                </div>
                <div>
                  <Label className="font-semibold">Phone</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Website</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrganization.website ? (
                      <a href={selectedOrganization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedOrganization.website}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization.companyLocation}</p>
                </div>
                <div>
                  <Label className="font-semibold">User Account</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrganization.user.email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Verification Status</Label>
                  <Badge className={verificationStatusColors[selectedOrganization.verifiedStatus]}>
                    {selectedOrganization.verifiedStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Active Status</Label>
                  <Badge className={activeStatusColors[selectedOrganization.activeStatus]}>
                    {selectedOrganization.activeStatus}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Trainings ({selectedOrganization.trainings.length})</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrganization.trainings.length > 0 ? (
                    selectedOrganization.trainings.map((training: any) => (
                      <div key={training.id} className="p-2 border rounded text-sm">
                        <div className="font-medium">{training.title}</div>
                        <div className="text-muted-foreground">
                          {training.category?.name || 'Unknown Category'} • {training.location ? `${training.location.state}, ${training.location.district}` : 'Unknown Location'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No trainings found</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Feedback ({selectedOrganization.feedbacks.length})</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrganization.feedbacks.length > 0 ? (
                    selectedOrganization.feedbacks.map((feedback: any) => (
                      <div key={feedback.id} className="p-2 border rounded text-sm">
                        <div className="flex items-center gap-2">
                          <span>⭐ {feedback.overallRating || 'N/A'}</span>
                          <span>by {feedback.freelancer?.user?.name || feedback.freelancer?.user?.email || 'Unknown Freelancer'}</span>
                        </div>
                        {feedback.comments && (
                          <p className="text-muted-foreground mt-1">{feedback.comments}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No feedback found</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Organization</DialogTitle>
            <DialogDescription>
              Update organization information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  value={editForm.organizationName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, organizationName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactMail">Contact Email</Label>
                <Input
                  id="contactMail"
                  type="email"
                  value={editForm.contactMail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, contactMail: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLocation">Company Location</Label>
              <Input
                id="companyLocation"
                value={editForm.companyLocation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, companyLocation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={editForm.logo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, logo: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrganization}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedOrganization?.organizationName}"? This action cannot be undone and will permanently remove the organization and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteOrganization}>
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Organization Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization account. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={addForm.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="organization@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={addForm.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Admin Name</Label>
              <Input
                id="name"
                value={addForm.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Admin full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={addForm.organizationName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, organizationName: e.target.value }))}
                placeholder="Organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={addForm.website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactMail">Contact Email *</Label>
              <Input
                id="contactMail"
                type="email"
                value={addForm.contactMail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, contactMail: e.target.value }))}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={addForm.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLocation">Company Location *</Label>
              <Input
                id="companyLocation"
                value={addForm.companyLocation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, companyLocation: e.target.value }))}
                placeholder="City, State, Country"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={addForm.logo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddForm(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrganization}>
              Create Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  )
}