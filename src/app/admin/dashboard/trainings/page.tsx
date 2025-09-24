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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Settings, Download } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  email: string
  role: string
  name: string
}

interface TrainingCategory {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  trainingsCount: number
  activeTrainingsCount: number
}

export default function AdminTrainingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState("ALL")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TrainingCategory | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: searchTerm,
        ...(isActiveFilter !== "ALL" && { isActive: isActiveFilter === "true" }),
      })
      
      const response = await fetch(`/api/training-categories?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch training categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching training categories:', error)
      toast.error('Failed to load training categories')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, isActiveFilter])

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
      fetchCategories()
    }
  }, [status, session, fetchCategories])

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [categories, searchTerm])

  const handleEdit = (category: TrainingCategory) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      
      if (!formData.name || !formData.description) {
        toast.error("Name and description are required")
        return
      }

      const url = editingCategory ? '/api/training-categories' : '/api/training-categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = {
        ...(editingCategory && { id: editingCategory.id }),
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save category')
      }

      toast.success(`Training category ${editingCategory ? 'updated' : 'created'} successfully`)
      setIsDialogOpen(false)
      setEditingCategory(null)
      setFormData({ name: "", description: "", isActive: true })
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/training-categories?id=${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      toast.success('Training category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  const handleExportCSV = useCallback(() => {
    if (selectedCategories.length === 0) {
      toast.error("Please select categories to export")
      return
    }

    const categoriesToExport = categories.filter(cat => selectedCategories.includes(cat.id))
    
    // Create CSV content
    const headers = ["Category Name", "Description", "Status", "Total Trainings", "Active Trainings", "Created Date"]
    const csvContent = [
      headers.join(","),
      ...categoriesToExport.map(cat => [
        cat.name,
        cat.description,
        cat.isActive ? "Active" : "Inactive",
        cat.trainingsCount,
        cat.activeTrainingsCount,
        new Date(cat.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `training-categories_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${categoriesToExport.length} categories to CSV`)
  }, [selectedCategories, categories])

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedCategories(filteredCategories.map(cat => cat.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select categories to delete")
      return
    }

    try {
      const deletePromises = selectedCategories.map(id => 
        fetch(`/api/training-categories?id=${id}`, { method: 'DELETE' })
      )
      
      const responses = await Promise.all(deletePromises)
      const failedDeletes = responses.filter(response => !response.ok)
      
      if (failedDeletes.length > 0) {
        toast.error(`Failed to delete ${failedDeletes.length} categories`)
      } else {
        toast.success(`Successfully deleted ${selectedCategories.length} categories`)
        setSelectedCategories([])
        setIsSelectAll(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      toast.error('Failed to delete categories')
    }
  }

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

  return (
    <DashboardLayout userRole={user.role} userName={user.name || "Admin"}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Manage training categories, types, and locations</p>
        </div>
        <div className="flex gap-2">
          {selectedCategories.length > 0 && (
            <>
              <Button variant="outline" onClick={handleBulkDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedCategories.length})
              </Button>
              <Badge variant="secondary">
                {selectedCategories.length} selected
              </Badge>
            </>
          )}
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory 
                    ? "Update the training category information."
                    : "Create a new training category for the platform."
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
                    placeholder="e.g., FRAMEWORKS"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Describe this training category..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isActive" className="text-right">
                    Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingCategory ? "Update" : "Save")}
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
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{categories.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{categories.filter(c => c.isActive).length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{categories.reduce((sum, cat) => sum + cat.trainingsCount, 0)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {categories.length > 0 ? categories.reduce((max, cat) => cat.trainingsCount > max.trainingsCount ? cat : max, categories[0])?.name || 'N/A' : 'N/A'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Training Categories</CardTitle>
          <CardDescription>Manage training categories and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isSelectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all categories"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Trainings</TableHead>
                  <TableHead>Active Trainings</TableHead>
                  <TableHead>Status</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                          aria-label={`Select ${category.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>{category.trainingsCount}</TableCell>
                      <TableCell>{category.activeTrainingsCount}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(category.id)}
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
          
          {!loading && filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No training categories found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Training Types
            </CardTitle>
            <CardDescription>Manage available training types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border rounded">
                <span>CORPORATE</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex justify-between items-center p-2 border rounded">
                <span>UNIVERSITY</span>
                <Badge variant="outline">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common training management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Manage Training Locations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Manage Stacks & Frameworks
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Training Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  )
}