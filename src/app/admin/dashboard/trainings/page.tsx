"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo, useTransition } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Settings, Download, Upload, MapPin, Code, FolderOpen, Grid3X3 } from "lucide-react"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TrainingCategorySchema, TrainingLocationSchema, StackSchema } from "@/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Interfaces
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

interface TrainingLocation {
  id: string
  state: string
  district: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  trainingsCount: number
  activeTrainingsCount: number
}

interface Stack {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  trainingsCount: number
  activeTrainingsCount: number
}

export default function AdminTrainingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Categories state
  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const [categoryActiveFilter, setCategoryActiveFilter] = useState("ALL")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isCategorySelectAll, setIsCategorySelectAll] = useState(false)

  // Locations state
  const [locations, setLocations] = useState<TrainingLocation[]>([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [locationSearchTerm, setLocationSearchTerm] = useState("")
  const [locationActiveFilter, setLocationActiveFilter] = useState("ALL")
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [isLocationSelectAll, setIsLocationSelectAll] = useState(false)

  // Stacks state
  const [stacks, setStacks] = useState<Stack[]>([])
  const [stacksLoading, setStacksLoading] = useState(true)
  const [stackSearchTerm, setStackSearchTerm] = useState("")
  const [selectedStacks, setSelectedStacks] = useState<string[]>([])
  const [isStackSelectAll, setIsStackSelectAll] = useState(false)

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isStackDialogOpen, setIsStackDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TrainingCategory | null>(null)
  const [editingLocation, setEditingLocation] = useState<TrainingLocation | null>(null)
  const [editingStack, setEditingStack] = useState<Stack | null>(null)

  // Forms
  const categoryForm = useForm({
    resolver: zodResolver(TrainingCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  })

  const locationForm = useForm({
    resolver: zodResolver(TrainingLocationSchema),
    defaultValues: {
      state: "",
      district: "",
      isActive: true,
    },
  })

  const stackForm = useForm({
    resolver: zodResolver(StackSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Fetch functions
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const params = new URLSearchParams({
        search: categorySearchTerm,
        ...(categoryActiveFilter !== "ALL" && { isActive: categoryActiveFilter === "true" }),
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
      setCategoriesLoading(false)
    }
  }, [categorySearchTerm, categoryActiveFilter])

  const fetchLocations = useCallback(async () => {
    try {
      setLocationsLoading(true)
      const params = new URLSearchParams({
        search: locationSearchTerm,
        ...(locationActiveFilter !== "ALL" && { isActive: locationActiveFilter === "true" }),
      })
      
      const response = await fetch(`/api/training-locations?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch training locations')
      }
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching training locations:', error)
      toast.error('Failed to load training locations')
    } finally {
      setLocationsLoading(false)
    }
  }, [locationSearchTerm, locationActiveFilter])

  const fetchStacks = useCallback(async () => {
    try {
      setStacksLoading(true)
      const params = new URLSearchParams({
        search: stackSearchTerm,
      })
      
      const response = await fetch(`/api/stacks?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch stacks')
      }
      const data = await response.json()
      setStacks(data)
    } catch (error) {
      console.error('Error fetching stacks:', error)
      toast.error('Failed to load stacks')
    } finally {
      setStacksLoading(false)
    }
  }, [stackSearchTerm])

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
      fetchLocations()
      fetchStacks()
    }
  }, [status, session, fetchCategories, fetchLocations, fetchStacks])

  // Reset forms when dialogs are closed
  useEffect(() => {
    if (!isCategoryDialogOpen) {
      setEditingCategory(null)
      categoryForm.reset()
    }
  }, [isCategoryDialogOpen, categoryForm])

  useEffect(() => {
    if (!isLocationDialogOpen) {
      setEditingLocation(null)
      locationForm.reset()
    }
  }, [isLocationDialogOpen, locationForm])

  useEffect(() => {
    if (!isStackDialogOpen) {
      setEditingStack(null)
      stackForm.reset()
    }
  }, [isStackDialogOpen, stackForm])

  // Filter functions
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(categorySearchTerm.toLowerCase())
    )
  }, [categories, categorySearchTerm])

  const filteredLocations = useMemo(() => {
    return locations.filter(location =>
      location.state.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
      location.district.toLowerCase().includes(locationSearchTerm.toLowerCase())
    )
  }, [locations, locationSearchTerm])

  const filteredStacks = useMemo(() => {
    return stacks.filter(stack =>
      stack.name.toLowerCase().includes(stackSearchTerm.toLowerCase()) ||
      (stack.description && stack.description.toLowerCase().includes(stackSearchTerm.toLowerCase()))
    )
  }, [stacks, stackSearchTerm])

  // Edit handlers
  const handleEditCategory = (category: TrainingCategory) => {
    setEditingCategory(category)
    categoryForm.reset({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    })
    setIsCategoryDialogOpen(true)
  }

  const handleEditLocation = (location: TrainingLocation) => {
    setEditingLocation(location)
    locationForm.reset({
      state: location.state,
      district: location.district,
      isActive: location.isActive,
    })
    setIsLocationDialogOpen(true)
  }

  const handleEditStack = (stack: Stack) => {
    setEditingStack(stack)
    stackForm.reset({
      name: stack.name,
      description: stack.description || "",
    })
    setIsStackDialogOpen(true)
  }

  // Save handlers
  const handleSaveCategory = categoryForm.handleSubmit(async (data) => {
    startTransition(async () => {
      try {
        const url = editingCategory ? '/api/training-categories' : '/api/training-categories'
        const method = editingCategory ? 'PUT' : 'POST'
        const body = {
          ...(editingCategory && { id: editingCategory.id }),
          ...data,
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
        setIsCategoryDialogOpen(false)
        setEditingCategory(null)
        categoryForm.reset()
        fetchCategories()
      } catch (error) {
        console.error('Error saving category:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to save category')
      }
    })
  })

  const handleSaveLocation = locationForm.handleSubmit(async (data) => {
    startTransition(async () => {
      try {
        const url = editingLocation ? '/api/training-locations' : '/api/training-locations'
        const method = editingLocation ? 'PUT' : 'POST'
        const body = {
          ...(editingLocation && { id: editingLocation.id }),
          ...data,
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
          throw new Error(errorData.error || 'Failed to save location')
        }

        toast.success(`Training location ${editingLocation ? 'updated' : 'created'} successfully`)
        setIsLocationDialogOpen(false)
        setEditingLocation(null)
        locationForm.reset()
        fetchLocations()
      } catch (error) {
        console.error('Error saving location:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to save location')
      }
    })
  })

  const handleSaveStack = stackForm.handleSubmit(async (data) => {
    startTransition(async () => {
      try {
        const url = editingStack ? '/api/stacks' : '/api/stacks'
        const method = editingStack ? 'PUT' : 'POST'
        const body = {
          ...(editingStack && { id: editingStack.id }),
          ...data,
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
          throw new Error(errorData.error || 'Failed to save stack')
        }

        toast.success(`Stack ${editingStack ? 'updated' : 'created'} successfully`)
        setIsStackDialogOpen(false)
        setEditingStack(null)
        stackForm.reset()
        fetchStacks()
      } catch (error) {
        console.error('Error saving stack:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to save stack')
      }
    })
  })

  // Delete handlers
  const handleDeleteCategory = async (categoryId: string) => {
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

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const response = await fetch(`/api/training-locations?id=${locationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete location')
      }

      toast.success('Training location deleted successfully')
      fetchLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete location')
    }
  }

  const handleDeleteStack = async (stackId: string) => {
    try {
      const response = await fetch(`/api/stacks?id=${stackId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete stack')
      }

      toast.success('Stack deleted successfully')
      fetchStacks()
    } catch (error) {
      console.error('Error deleting stack:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete stack')
    }
  }

  // Select handlers
  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleSelectLocation = (locationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations(prev => [...prev, locationId])
    } else {
      setSelectedLocations(prev => prev.filter(id => id !== location))
    }
  }

  const handleSelectStack = (stackId: string, checked: boolean) => {
    if (checked) {
      setSelectedStacks(prev => [...prev, stackId])
    } else {
      setSelectedStacks(prev => prev.filter(id => id !== stack))
    }
  }

  const handleSelectAllCategories = (checked: boolean) => {
    setIsCategorySelectAll(checked)
    if (checked) {
      setSelectedCategories(filteredCategories.map(cat => cat.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelectAllLocations = (checked: boolean) => {
    setIsLocationSelectAll(checked)
    if (checked) {
      setSelectedLocations(filteredLocations.map(loc => loc.id))
    } else {
      setSelectedLocations([])
    }
  }

  const handleSelectAllStacks = (checked: boolean) => {
    setIsStackSelectAll(checked)
    if (checked) {
      setSelectedStacks(filteredStacks.map(stack => stack.id))
    } else {
      setSelectedStacks([])
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
            <p className="text-muted-foreground">Manage training categories, locations, and stacks</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{categories.length}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{locations.length}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Stacks</CardTitle>
            </CardHeader>
            <CardContent>
              {stacksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stacks.length}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading || locationsLoading || stacksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.trainingsCount, 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="stacks" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Stacks
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Training Categories</CardTitle>
                    <CardDescription>Manage training categories for the platform</CardDescription>
                  </div>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
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
                      <Form {...categoryForm}>
                        <form onSubmit={handleSaveCategory} className="space-y-4">
                          <FormField
                            control={categoryForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., FRAMEWORKS" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={categoryForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this training category..." 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={categoryForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>
                                    Enable this category to be visible in the platform
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsCategoryDialogOpen(false)
                                setEditingCategory(null)
                                categoryForm.reset()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Saving..." : (editingCategory ? "Update" : "Save")}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search categories..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={categoryActiveFilter} onValueChange={setCategoryActiveFilter}>
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

                  {/* Categories Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={isCategorySelectAll}
                              onCheckedChange={handleSelectAllCategories}
                              aria-label="Select all categories"
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Trainings</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoriesLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            </TableRow>
                          ))
                        ) : filteredCategories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No categories found matching your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCategories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedCategories.includes(category.id)}
                                  onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                                  aria-label={`Select category ${category.name}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                              <TableCell>
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                  {category.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>{category.trainingsCount}</TableCell>
                              <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteCategory(category.id)}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Training Locations</CardTitle>
                    <CardDescription>Manage training locations (states and districts)</CardDescription>
                  </div>
                  <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingLocation ? "Edit Location" : "Add New Location"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingLocation 
                            ? "Update the training location information."
                            : "Create a new training location for the platform."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...locationForm}>
                        <form onSubmit={handleSaveLocation} className="space-y-4">
                          <FormField
                            control={locationForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Karnataka" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={locationForm.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>District</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Bangalore" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={locationForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>
                                    Enable this location to be visible in the platform
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsLocationDialogOpen(false)
                                setEditingLocation(null)
                                locationForm.reset()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Saving..." : (editingLocation ? "Update" : "Save")}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search locations..."
                          value={locationSearchTerm}
                          onChange={(e) => setLocationSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={locationActiveFilter} onValueChange={setLocationActiveFilter}>
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

                  {/* Locations Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={isLocationSelectAll}
                              onCheckedChange={handleSelectAllLocations}
                              aria-label="Select all locations"
                            />
                          </TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>District</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Trainings</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locationsLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            </TableRow>
                          ))
                        ) : filteredLocations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No locations found matching your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredLocations.map((location) => (
                            <TableRow key={location.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedLocations.includes(location.id)}
                                  onCheckedChange={(checked) => handleSelectLocation(location.id, checked as boolean)}
                                  aria-label={`Select location ${location.state}, ${location.district}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{location.state}</TableCell>
                              <TableCell>{location.district}</TableCell>
                              <TableCell>
                                <Badge variant={location.isActive ? "default" : "secondary"}>
                                  {location.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>{location.trainingsCount}</TableCell>
                              <TableCell>{new Date(location.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditLocation(location)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteLocation(location.id)}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stacks Tab */}
          <TabsContent value="stacks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Stacks & Frameworks</CardTitle>
                    <CardDescription>Manage technology stacks and frameworks</CardDescription>
                  </div>
                  <Dialog open={isStackDialogOpen} onOpenChange={setIsStackDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stack
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingStack ? "Edit Stack" : "Add New Stack"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingStack 
                            ? "Update the stack information."
                            : "Create a new technology stack or framework."
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...stackForm}>
                        <form onSubmit={handleSaveStack} className="space-y-4">
                          <FormField
                            control={stackForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., React.js" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={stackForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe this technology stack..." 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsStackDialogOpen(false)
                                setEditingStack(null)
                                stackForm.reset()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Saving..." : (editingStack ? "Update" : "Save")}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search stacks..."
                        value={stackSearchTerm}
                        onChange={(e) => setStackSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Stacks Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={isStackSelectAll}
                              onCheckedChange={handleSelectAllStacks}
                              aria-label="Select all stacks"
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Trainings</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stacksLoading ? (
                          Array.from({ length: 5 }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            </TableRow>
                          ))
                        ) : filteredStacks.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No stacks found matching your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredStacks.map((stack) => (
                            <TableRow key={stack.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedStacks.includes(stack.id)}
                                  onCheckedChange={(checked) => handleSelectStack(stack.id, checked as boolean)}
                                  aria-label={`Select stack ${stack.name}`}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{stack.name}</TableCell>
                              <TableCell className="max-w-xs truncate">{stack.description}</TableCell>
                              <TableCell>{stack.trainingsCount}</TableCell>
                              <TableCell>{new Date(stack.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditStack(stack)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteStack(stack.id)}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}