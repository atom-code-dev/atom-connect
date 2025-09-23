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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Settings, UserCheck, UserX, Calendar } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  name: string
}

// Dummy data for maintainers
const dummyMaintainers = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+91-9876543210",
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
    status: "ACTIVE",
    reviewsCount: 45,
    approvedTrainings: 23,
    rejectedTrainings: 5,
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+91-9876543211",
    joinDate: "2024-01-10",
    lastLogin: "2024-01-19",
    status: "ACTIVE",
    reviewsCount: 32,
    approvedTrainings: 18,
    rejectedTrainings: 3,
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@example.com",
    phone: "+91-9876543212",
    joinDate: "2024-01-08",
    lastLogin: "2024-01-12",
    status: "INACTIVE",
    reviewsCount: 28,
    approvedTrainings: 15,
    rejectedTrainings: 2,
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+91-9876543213",
    joinDate: "2024-01-05",
    lastLogin: "2024-01-20",
    status: "ACTIVE",
    reviewsCount: 67,
    approvedTrainings: 35,
    rejectedTrainings: 8,
  },
]

export default function AdminMaintainersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaintainer, setEditingMaintainer] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  })

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

  const filteredMaintainers = dummyMaintainers.filter(maintainer =>
    maintainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    maintainer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (maintainer) => {
    setEditingMaintainer(maintainer)
    setFormData({
      name: maintainer.name,
      email: maintainer.email,
      phone: maintainer.phone,
      status: maintainer.status,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // Save logic would go here
    console.log("Saving maintainer:", formData)
    setIsDialogOpen(false)
    setEditingMaintainer(null)
    setFormData({ name: "", email: "", phone: "", status: "ACTIVE" })
  }

  const handleDelete = (maintainerId) => {
    // Delete logic would go here
    console.log("Deleting maintainer:", maintainerId)
  }

  const toggleStatus = (maintainerId, currentStatus) => {
    // Toggle status logic would go here
    console.log("Toggling status for maintainer:", maintainerId, "to", currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE")
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name || "Admin"}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Maintainers Management</h1>
          <p className="text-muted-foreground">Manage platform maintainers and reviewers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingMaintainer ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Maintainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyMaintainers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Maintainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyMaintainers.filter(m => m.status === "ACTIVE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyMaintainers.reduce((sum, m) => sum + m.reviewsCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyMaintainers.reduce((sum, m) => sum + m.approvedTrainings, 0)}</div>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredMaintainers.map((maintainer) => (
                  <TableRow key={maintainer.id}>
                    <TableCell className="font-medium">{maintainer.name}</TableCell>
                    <TableCell>{maintainer.email}</TableCell>
                    <TableCell>{maintainer.phone}</TableCell>
                    <TableCell>
                      <Badge variant={maintainer.status === "ACTIVE" ? "default" : "secondary"}>
                        {maintainer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{maintainer.reviewsCount}</TableCell>
                    <TableCell>{maintainer.approvedTrainings}</TableCell>
                    <TableCell>{new Date(maintainer.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(maintainer)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {maintainer.status === "ACTIVE" ? (
                            <DropdownMenuItem onClick={() => toggleStatus(maintainer.id, maintainer.status)}>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleStatus(maintainer.id, maintainer.status)}>
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
                ))}
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
                  <p className="font-medium">Alice Johnson</p>
                  <p className="text-sm text-muted-foreground">Approved training "React.js Advanced"</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Bob Smith</p>
                  <p className="text-sm text-muted-foreground">Reviewed organization "TechCorp"</p>
                </div>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">David Wilson</p>
                  <p className="text-sm text-muted-foreground">Rejected training "Basic Python"</p>
                </div>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
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
                <span className="font-medium">2.5 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Approval Rate</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Maintainers</span>
                <span className="font-medium">{dummyMaintainers.filter(m => m.status === "ACTIVE").length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pending Reviews</span>
                <span className="font-medium">15</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}