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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Settings, UserCheck, UserX, Calendar } from "lucide-react"
import HexagonLoader from "@/components/ui/hexagon-loader"

interface Maintainer {
  id: string
  email: string
  role: string
  name?: string
  phone?: string
  createdAt: string
  updatedAt: string
  maintainerProfile: {
    id: string
    userId: string
    status: "ACTIVE" | "INACTIVE"
    createdAt: string
    updatedAt: string
  }
  reviewsCount: number
  approvedTrainings: number
  rejectedTrainings: number
}

export default function AdminMaintainersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaintainer, setEditingMaintainer] = useState<Maintainer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [maintainers, setMaintainers] = useState<Maintainer[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
      fetchMaintainers()
    }
  }, [status, session])

  // Show welcome toast when component mounts
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN" && !loading && maintainers.length === 0) {
      setTimeout(() => {
        toast.info("Welcome to Maintainers Management! Click 'Create Test Maintainer' to get started.")
      }, 1000)
    }
  }, [status, session, loading, maintainers.length])

  const fetchMaintainers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      
      console.log("Fetching maintainers with params:", params.toString())
      
      const response = await fetch(`/api/maintainers?${params}`)
      console.log("Fetch response status:", response.status)
      
      if (!response.ok) {
        throw new Error("Failed to fetch maintainers")
      }
      
      const data = await response.json()
      console.log("Fetched maintainers:", data)
      setMaintainers(data)
      
      // Show success toast for successful data load (only on initial load, not search)
      if (!searchTerm) {
        toast.success("Maintainers loaded successfully")
      } else if (searchTerm && data.length > 0) {
        toast.success(`Found ${data.length} maintainer(s) matching "${searchTerm}"`)
      } else if (searchTerm && data.length === 0) {
        toast.info(`No maintainers found matching "${searchTerm}"`)
      }
    } catch (error) {
      console.error("Error fetching maintainers:", error)
      toast.error("Failed to load maintainers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === "authenticated" && session?.user?.role === "ADMIN") {
        fetchMaintainers()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleEdit = (maintainer: Maintainer) => {
    setEditingMaintainer(maintainer)
    setFormData({
      name: maintainer.name || "",
      email: maintainer.email,
      phone: maintainer.phone || "",
      password: "",
    })
    setIsDialogOpen(true)
    toast.info(`Editing maintainer: ${maintainer.name || maintainer.email}`)
  }

  const handleSave = async () => {
    try {
      if (!formData.email || (!editingMaintainer && !formData.password)) {
        toast.error("Email and password are required for new maintainers")
        return
      }

      const url = editingMaintainer 
        ? `/api/maintainers/${editingMaintainer.id}`
        : `/api/maintainers`
      
      const method = editingMaintainer ? "PUT" : "POST"
      
      console.log("Saving maintainer:", { url, method, formData })
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Save response status:", response.status)
      
      if (!response.ok) {
        const error = await response.json()
        console.error("Save error:", error)
        throw new Error(error.error || "Failed to save maintainer")
      }

      const data = await response.json()
      console.log("Save success:", data)
      
      const action = editingMaintainer ? "updated" : "created"
      const maintainerName = formData.name || formData.email
      toast.success(`Maintainer ${action} successfully: ${maintainerName}`)
      
      setIsDialogOpen(false)
      setEditingMaintainer(null)
      setFormData({ name: "", email: "", phone: "", password: "" })
      fetchMaintainers()
    } catch (error) {
      console.error("Error saving maintainer:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save maintainer")
    }
  }

  const handleDelete = async (maintainerId: string) => {
    const maintainer = maintainers.find(m => m.id === maintainerId)
    const maintainerName = maintainer?.name || maintainer?.email || "Unknown"
    
    if (!confirm(`Are you sure you want to delete ${maintainerName}? This action cannot be undone.`)) {
      toast.info("Deletion cancelled")
      return
    }

    try {
      setActionLoading(maintainerId)
      toast.loading(`Deleting ${maintainerName}...`)
      
      const response = await fetch(`/api/maintainers/${maintainerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete maintainer")
      }

      toast.success(`${maintainerName} deleted successfully`)
      fetchMaintainers()
    } catch (error) {
      console.error("Error deleting maintainer:", error)
      toast.error(`Failed to delete ${maintainerName}`)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleStatus = async (maintainerId: string, currentStatus: string) => {
    const maintainer = maintainers.find(m => m.id === maintainerId)
    const maintainerName = maintainer?.name || maintainer?.email || "Unknown"
    const action = currentStatus === "ACTIVE" ? "deactivate" : "activate"
    const actionPast = currentStatus === "ACTIVE" ? "deactivated" : "activated"
    
    try {
      setActionLoading(maintainerId)
      toast.loading(`${action === "activate" ? "Activating" : "Deactivating"} ${maintainerName}...`)
      
      console.log("Toggling status for maintainer:", maintainerId, "action:", action)
      
      const response = await fetch(`/api/maintainers/${maintainerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      console.log("Response status:", response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response:", errorData)
        throw new Error(`Failed to ${action} maintainer: ${errorData.error}`)
      }

      const data = await response.json()
      console.log("Success response:", data)
      
      toast.success(`${maintainerName} ${actionPast} successfully`)
      fetchMaintainers()
    } catch (error) {
      console.error("Error toggling maintainer status:", error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} maintainer`)
    } finally {
      setActionLoading(null)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <HexagonLoader size={64} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  const user = session.user

  return (
    <DashboardLayout userRole={user.role} userName={user.name || "Admin"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Maintainers Management</h1>
            <p className="text-muted-foreground">Manage platform maintainers and reviewers</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  toast.loading("Creating test maintainer...")
                  
                  const testData = {
                    name: "Test Maintainer",
                    email: "test@example.com",
                    phone: "+1234567890",
                    password: "password123"
                  }
                  
                  const response = await fetch('/api/maintainers', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(testData),
                  })
                  
                  if (response.ok) {
                    toast.success("Test maintainer created successfully")
                    fetchMaintainers()
                  } else {
                    const error = await response.json()
                    toast.error(`Failed to create test maintainer: ${error.error}`)
                  }
                } catch (error) {
                  toast.error("Failed to create test maintainer")
                }
              }}
            >
              Create Test Maintainer
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              if (!open && editingMaintainer) {
                toast.info("Cancelled editing maintainer")
                setEditingMaintainer(null)
                setFormData({ name: "", email: "", phone: "", password: "" })
              }
              setIsDialogOpen(open)
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  toast.info("Opening add maintainer dialog")
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Maintainer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingMaintainer ? "Edit Maintainer" : "Add New Maintainer"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMaintainer 
                      ? "Update the maintainer information."
                      : "Create a new maintainer account for the platform."
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="col-span-3"
                      disabled={!!editingMaintainer}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  {!editingMaintainer && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false)
                    if (editingMaintainer) {
                      toast.info("Cancelled editing maintainer")
                      setEditingMaintainer(null)
                      setFormData({ name: "", email: "", phone: "", password: "" })
                    } else {
                      toast.info("Cancelled adding new maintainer")
                    }
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    {editingMaintainer ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Maintainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintainers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Maintainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintainers.filter(m => m.maintainerProfile.status === "ACTIVE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintainers.reduce((sum, m) => sum + m.reviewsCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintainers.reduce((sum, m) => sum + m.approvedTrainings, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Maintainers List</CardTitle>
          <CardDescription>Manage all platform maintainers and their activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search maintainers..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  if (e.target.value) {
                    toast.info(`Searching for "${e.target.value}"...`)
                  }
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <HexagonLoader size={48} className="mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading maintainers...</p>
                    </TableCell>
                  </TableRow>
                ) : maintainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-muted-foreground">No maintainers found</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click "Create Test Maintainer" to add one for testing
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  maintainers.map((maintainer) => (
                    <TableRow key={maintainer.id}>
                      <TableCell className="font-medium">{maintainer.name || "N/A"}</TableCell>
                      <TableCell>{maintainer.email}</TableCell>
                      <TableCell>{maintainer.phone || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={maintainer.maintainerProfile.status === "ACTIVE" ? "default" : "secondary"}>
                          {maintainer.maintainerProfile.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{maintainer.reviewsCount}</TableCell>
                      <TableCell>{maintainer.approvedTrainings}</TableCell>
                      <TableCell>{new Date(maintainer.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={actionLoading === maintainer.id}>
                              {actionLoading === maintainer.id ? (
                                <HexagonLoader size={16} />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(maintainer)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {maintainer.maintainerProfile.status === "ACTIVE" ? (
                              <DropdownMenuItem onClick={() => toggleStatus(maintainer.id, maintainer.maintainerProfile.status)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => toggleStatus(maintainer.id, maintainer.maintainerProfile.status)}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(maintainer.id)}
                              className="text-red-600"
                            >
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
        </CardContent>
      </Card>

      {/* Maintainer Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest maintainer actions and reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Recent activities will appear here</p>
                  <p className="text-sm text-muted-foreground">System updates coming soon</p>
                </div>
                <span className="text-xs text-muted-foreground">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Maintainer efficiency and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Average Review Time</span>
                <span className="font-medium">Calculating...</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Approval Rate</span>
                <span className="font-medium">Calculating...</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Maintainers</span>
                <span className="font-medium">{maintainers.filter(m => m.maintainerProfile.status === "ACTIVE").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending Reviews</span>
                <span className="font-medium">Calculating...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}