"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"

// Dummy data for users
const dummyUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "FREELANCER",
    status: "ACTIVE",
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
    profileCompleted: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "ORGANIZATION",
    status: "ACTIVE",
    joinDate: "2024-01-10",
    lastLogin: "2024-01-19",
    profileCompleted: true,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "FREELANCER",
    status: "INACTIVE",
    joinDate: "2024-01-08",
    lastLogin: "2024-01-12",
    profileCompleted: false,
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "MAINTAINER",
    status: "ACTIVE",
    joinDate: "2024-01-05",
    lastLogin: "2024-01-20",
    profileCompleted: true,
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "ORGANIZATION",
    status: "PENDING",
    joinDate: "2024-01-18",
    lastLogin: "2024-01-18",
    profileCompleted: true,
  },
]

const roleColors = {
  FREELANCER: "bg-blue-100 text-blue-800",
  ORGANIZATION: "bg-green-100 text-green-800",
  ADMIN: "bg-purple-100 text-purple-800",
  MAINTAINER: "bg-orange-100 text-orange-800",
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)

  const filteredUsers = dummyUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    const matchesStatus = statusFilter === "ALL" || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleExportCSV = useCallback(() => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to export")
      return
    }

    const usersToExport = dummyUsers.filter(user => selectedUsers.includes(user.id))
    
    // Create CSV content
    const headers = ["Name", "Email", "Role", "Status", "Join Date", "Last Login", "Profile Completed"]
    const csvContent = [
      headers.join(","),
      ...usersToExport.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.joinDate,
        user.lastLogin,
        user.profileCompleted ? "Yes" : "No"
      ].join(","))
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `users_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${usersToExport.length} users to CSV`)
  }, [selectedUsers])

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to perform bulk action")
      return
    }

    const actionMessages = {
      activate: `Activated ${selectedUsers.length} users`,
      deactivate: `Deactivated ${selectedUsers.length} users`,
      delete: `Deleted ${selectedUsers.length} users`,
    }

    toast.success(actionMessages[action as keyof typeof actionMessages] || "Bulk action completed")
    setSelectedUsers([])
    setIsSelectAll(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <Select onValueChange={(value) => handleBulkAction(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedUsers.length} selected
              </Badge>
            </div>
          )}
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button>Add User</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.filter(u => u.status === "ACTIVE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.filter(u => u.role === "FREELANCER").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyUsers.filter(u => u.role === "ORGANIZATION").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="FREELANCER">Freelancer</SelectItem>
                <SelectItem value="ORGANIZATION">Organization</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MAINTAINER">Maintainer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Manage and view all users in the system</CardDescription>
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
                      aria-label="Select all users"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        aria-label={`Select ${user.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[user.status]}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.profileCompleted ? (
                        <Badge variant="outline" className="text-green-600">Complete</Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600">Incomplete</Badge>
                      )}
                    </TableCell>
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
                            Edit User
                          </DropdownMenuItem>
                          {user.status === "ACTIVE" ? (
                            <DropdownMenuItem>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <UserCheck className="h-4 w-4 mr-2" />
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}