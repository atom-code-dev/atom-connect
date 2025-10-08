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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, MoreHorizontal, Settings, Download, Upload, MapPin, Code, FolderOpen, Grid3X3, Calendar, DollarSign, Users, Building, Eye, EyeOff, CheckCircle, XCircle, BookOpen } from "lucide-react"
import HexagonLoader from "@/components/ui/hexagon-loader"
import { toast } from "sonner"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TrainingCategorySchema, TrainingLocationSchema, StackSchema, TrainingSchema } from "@/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { BulkActions, RowCheckbox, commonBulkActions } from "@/components/ui/bulk-actions"
import { exportToCSV, formatters } from "@/lib/export-utils"

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

interface Training {
  id: string
  title: string
  description: string
  skills: string[]
  type: string
  mode: string
  contractType: string
  experienceMin?: number
  experienceMax?: number
  openings: number
  tfa: string
  trainerPreference: string
  startDate: string
  endDate: string
  hasPayment: boolean
  paymentTerm?: number
  paymentAmount?: number
  isPublished: boolean
  isActive: boolean
  companyName: string
  companyLogo?: string
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
  }
  location: {
    id: string
    state: string
    district: string
  }
  stack: {
    id: string
    name: string
  }
  organization: {
    id: string
    organizationName: string
    user: {
      id: string
      email: string
    }
  }
  freelancer?: {
    id: string
    name: string
    user: {
      id: string
      email: string
    }
  }
}

export default function AdminTrainingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

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

  // Trainings state
  const [trainings, setTrainings] = useState<Training[]>([])
  const [trainingsLoading, setTrainingsLoading] = useState(true)
  const [trainingSearchTerm, setTrainingSearchTerm] = useState("")
  const [trainingTypeFilter, setTrainingTypeFilter] = useState("ALL")
  const [trainingStatusFilter, setTrainingStatusFilter] = useState("ALL")
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([])
  const [isTrainingSelectAll, setIsTrainingSelectAll] = useState(false)

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isStackDialogOpen, setIsStackDialogOpen] = useState(false)
  const [isTrainingDialogOpen, setIsTrainingDialogOpen] = useState(false)
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

  const trainingForm = useForm({
    resolver: zodResolver(TrainingSchema),
    defaultValues: {
      title: "",
      description: "",
      skills: [],
      categoryId: "",
      type: "CORPORATE",
      locationId: "",
      stackId: "",
      mode: "OFFLINE",
      contractType: "PER_DAY",
      experienceMin: undefined,
      experienceMax: undefined,
      openings: 1,
      tfa: "AVAILABLE",
      trainerPreference: "ALL_REGIONS",
      startDate: new Date(),
      endDate: new Date(),
      hasPayment: true,
      paymentTerm: undefined,
      paymentAmount: undefined,
      isPublished: false,
      isActive: true,
    },
  })

  // Fetch functions
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const params = new URLSearchParams()
      params.append('search', categorySearchTerm)
      if (categoryActiveFilter !== "ALL") {
        params.append('isActive', categoryActiveFilter === "true" ? "true" : "false")
      }
      
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
      const params = new URLSearchParams()
      params.append('search', locationSearchTerm)
      if (locationActiveFilter !== "ALL") {
        params.append('isActive', locationActiveFilter === "true" ? "true" : "false")
      }
      
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

  const fetchTrainings = useCallback(async () => {
    try {
      setTrainingsLoading(true)
      const params = new URLSearchParams({
        search: trainingSearchTerm,
        ...(trainingTypeFilter !== "ALL" && { type: trainingTypeFilter }),
        ...(trainingStatusFilter !== "ALL" && { 
          status: trainingStatusFilter === "ACTIVE" ? "active" : "inactive" 
        }),
      })
      
      const response = await fetch(`/api/trainings?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch trainings')
      }
      const data = await response.json()
      setTrainings(data.trainings || data)
    } catch (error) {
      console.error('Error fetching trainings:', error)
      toast.error('Failed to load trainings')
    } finally {
      setTrainingsLoading(false)
    }
  }, [trainingSearchTerm, trainingTypeFilter, trainingStatusFilter])

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
      fetchTrainings()
    }
  }, [status, session, fetchCategories, fetchLocations, fetchStacks, fetchTrainings])

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

  useEffect(() => {
    if (!isTrainingDialogOpen) {
      trainingForm.reset()
    }
  }, [isTrainingDialogOpen, trainingForm])

  // Helper function to parse skills JSON string
  const parseSkills = (skills: string | string[] | null | undefined): string[] => {
    if (!skills) return []
    
    if (Array.isArray(skills)) {
      return skills
    }
    
    try {
      return JSON.parse(skills)
    } catch {
      // If parsing fails, treat it as a comma-separated string
      return skills.split(',').map(s => s.trim()).filter(s => s)
    }
  }

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

  const filteredTrainings = useMemo(() => {
    return trainings.filter(training =>
      training.title.toLowerCase().includes(trainingSearchTerm.toLowerCase()) ||
      training.description.toLowerCase().includes(trainingSearchTerm.toLowerCase()) ||
      training.companyName.toLowerCase().includes(trainingSearchTerm.toLowerCase())
    )
  }, [trainings, trainingSearchTerm])

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

  const handleSaveLocation = locationForm.handleSubmit(async (data) => {
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

  const handleSaveStack = stackForm.handleSubmit(async (data) => {
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

  const handleSaveTraining = trainingForm.handleSubmit(async (data) => {
    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create training')
      }

      toast.success('Training created successfully')
      setIsTrainingDialogOpen(false)
      trainingForm.reset()
      fetchTrainings()
    } catch (error) {
      console.error('Error creating training:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create training')
    }
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

  // Training management handlers
  const handleTrainingAction = async (trainingIds: string[], action: string) => {
    try {
      const response = await fetch('/api/trainings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainingIds,
          action
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to perform action')
      }

      const actionMessages = {
        activate: `Activated ${trainingIds.length} trainings`,
        deactivate: `Deactivated ${trainingIds.length} trainings`,
        publish: `Published ${trainingIds.length} trainings`,
        unpublish: `Unpublished ${trainingIds.length} trainings`,
        delete: `Deleted ${trainingIds.length} trainings`,
      }

      toast.success(actionMessages[action as keyof typeof actionMessages] || "Action completed")
      setSelectedTrainings([])
      setIsTrainingSelectAll(false)
      fetchTrainings()
    } catch (error) {
      console.error('Error performing training action:', error)
      toast.error('Failed to perform action')
    }
  }

  const handleSelectTraining = (trainingId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrainings(prev => [...prev, trainingId])
    } else {
      setSelectedTrainings(prev => prev.filter(id => id !== trainingId))
    }
  }

  const handleSelectAllTrainings = (checked: boolean) => {
    setIsTrainingSelectAll(checked)
    if (checked) {
      setSelectedTrainings(filteredTrainings.map(training => training.id))
    } else {
      setSelectedTrainings([])
    }
  }

  // Select handlers for other entities
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
      setSelectedLocations(prev => prev.filter(id => id !== locationId))
    }
  }

  const handleSelectStack = (stackId: string, checked: boolean) => {
    if (checked) {
      setSelectedStacks(prev => [...prev, stackId])
    } else {
      setSelectedStacks(prev => prev.filter(id => id !== stackId))
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
            <h1 className="text-3xl font-bold">Training Management</h1>
            <p className="text-muted-foreground">Manage training categories, locations, stacks, and postings</p>
          </div>
          <Button onClick={() => {
            fetchCategories()
            fetchLocations()
            fetchStacks()
            fetchTrainings()
          }}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="trainings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trainings" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training Postings
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="stacks" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Stacks
            </TabsTrigger>
          </TabsList>

          {/* Training Postings Tab */}
          <TabsContent value="trainings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Training Postings
                    </CardTitle>
                    <CardDescription>
                      Manage all training postings, their status, and assignments
                    </CardDescription>
                  </div>
                  <Dialog open={isTrainingDialogOpen} onOpenChange={setIsTrainingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Training
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Training</DialogTitle>
                        <DialogDescription>
                          Fill in the details to create a new training posting
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...trainingForm}>
                        <form onSubmit={handleSaveTraining} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter training title" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="openings"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Number of Trainers Needed</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="1" 
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={trainingForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter training description" 
                                    className="min-h-[100px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="mode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Training Mode</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select mode" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="ONLINE">Online</SelectItem>
                                      <SelectItem value="OFFLINE">Offline</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="contractType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contract Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select contract type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="PER_DAY">Per Day</SelectItem>
                                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="tfa"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Training Facility Availability (TFA)</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select TFA status" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="AVAILABLE">Available</SelectItem>
                                      <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="experienceMin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Minimum Experience (years)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      min="0"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="experienceMax"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Maximum Experience (years)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="5" 
                                      min="0"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={trainingForm.control}
                            name="trainerPreference"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trainer Preference</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select trainer preference" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="LOCAL">Local</SelectItem>
                                    <SelectItem value="REGIONAL_NORTH">Regional North</SelectItem>
                                    <SelectItem value="REGIONAL_SOUTH">Regional South</SelectItem>
                                    <SelectItem value="ALL_REGIONS">All Regions</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                          {category.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                                      <SelectItem value="UNIVERSITY">University</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="locationId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Location</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {locations.map((location) => (
                                        <SelectItem key={location.id} value={location.id}>
                                          {location.state}, {location.district}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="stackId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stack/Technology</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select stack" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {stacks.map((stack) => (
                                        <SelectItem key={stack.id} value={stack.id}>
                                          {stack.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="skills"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Skills (comma-separated)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="React, Node.js, MongoDB" 
                                      {...field}
                                      onChange={(e) => {
                                        const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                        field.onChange(skills)
                                      }}
                                      value={field.value.join(', ')}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Date</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      {...field}
                                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                      onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Date</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="date" 
                                      {...field}
                                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                      onChange={(e) => field.onChange(new Date(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={trainingForm.control}
                              name="paymentTerm"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Payment Term (days)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="30" 
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="paymentAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Payment Amount</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0.00" 
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={trainingForm.control}
                            name="hasPayment"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Enable Payment</FormLabel>
                                  <FormDescription>
                                    Toggle to enable/disable payment for this training
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={trainingForm.control}
                              name="isPublished"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>Published</FormLabel>
                                    <FormDescription>
                                      Make this training visible to users
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
                            <FormField
                              control={trainingForm.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                  <div className="space-y-0.5">
                                    <FormLabel>Active</FormLabel>
                                    <FormDescription>
                                      Enable this training for applications
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
                          </div>

                          <DialogFooter>
                            <Button type="submit" disabled={trainingForm.formState.isSubmitting}>
                              {trainingForm.formState.isSubmitting ? "Creating..." : "Create Training"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search trainings..."
                      value={trainingSearchTerm}
                      onChange={(e) => setTrainingSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={trainingTypeFilter} onValueChange={setTrainingTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                      <SelectItem value="UNIVERSITY">University</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={trainingStatusFilter} onValueChange={setTrainingStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedTrainings.length > 0 && (
                  <BulkActions
                    selectedItems={selectedTrainings}
                    totalItems={trainings.length}
                    filteredItems={trainings}
                    onSelectAll={(checked) => {
                      if (checked) {
                        setSelectedTrainings(trainings.map(t => t.id))
                      } else {
                        setSelectedTrainings([])
                      }
                      setIsTrainingSelectAll(checked)
                    }}
                    onSelectItem={(itemId, checked) => {
                      if (checked) {
                        setSelectedTrainings(prev => [...prev, itemId])
                      } else {
                        setSelectedTrainings(prev => prev.filter(id => id !== itemId))
                      }
                    }}
                    onBulkAction={(action) => handleTrainingAction(selectedTrainings, action)}
                    actionOptions={[
                      { label: "Activate", value: "activate", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
                      { label: "Deactivate", value: "deactivate", icon: <XCircle className="h-4 w-4 text-red-600" /> },
                      { label: "Publish", value: "publish", icon: <Eye className="h-4 w-4 text-blue-600" /> },
                      { label: "Unpublish", value: "unpublish", icon: <EyeOff className="h-4 w-4 text-orange-600" /> },
                      { label: "Delete", value: "delete", icon: <Trash2 className="h-4 w-4 text-red-600" /> },
                    ]}
                    itemName="trainings"
                    isSelectAll={isTrainingSelectAll}
                  />
                )}

                {/* Trainings Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isTrainingSelectAll}
                            onCheckedChange={handleSelectAllTrainings}
                          />
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingsLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredTrainings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-8">
                            <p className="text-muted-foreground">No trainings found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTrainings.map((training) => (
                          <TableRow key={training.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedTrainings.includes(training.id)}
                                onCheckedChange={(checked) => handleSelectTraining(training.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{training.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {(() => {
                                    const skills = parseSkills(training.skills)
                                    return (
                                      <>
                                        {skills.slice(0, 2).join(", ")}
                                        {skills.length > 2 && "..."}
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {training.organization.organizationName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{training.category.name}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={training.type === "CORPORATE" ? "default" : "secondary"}>
                                {training.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {training.location.state}, {training.location.district}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">
                                ${training.paymentAmount?.toLocaleString() || '0'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {training.paymentTerm || 0} days
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Badge variant={training.isActive ? "default" : "secondary"}>
                                  {training.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Badge variant={training.isPublished ? "default" : "outline"}>
                                  {training.isPublished ? "Published" : "Draft"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/trainings/${training.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTrainingAction([training.id], training.isActive ? "deactivate" : "activate")}>
                                    {training.isActive ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    {training.isActive ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTrainingAction([training.id], training.isPublished ? "unpublish" : "publish")}>
                                    {training.isPublished ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                    {training.isPublished ? "Unpublish" : "Publish"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleTrainingAction([training.id], "delete")}
                                    className="text-destructive"
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
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Training Categories
                </CardTitle>
                <CardDescription>
                  Manage training categories and their classifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Category Button */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-[300px]"
                    />
                    <Select value={categoryActiveFilter} onValueChange={setCategoryActiveFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? "Edit Category" : "Add New Category"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCategory ? "Update the category details" : "Create a new training category"}
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
                                  <Input placeholder="Category name" {...field} />
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
                                  <Textarea placeholder="Category description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={categoryForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Active Status</FormLabel>
                                  <FormDescription>
                                    Enable or disable this category
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
                            <Button type="submit" disabled={categoryForm.formState.isSubmitting}>
                              {categoryForm.formState.isSubmitting ? "Saving..." : "Save Category"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Categories Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isCategorySelectAll}
                            onCheckedChange={handleSelectAllCategories}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Trainings</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoriesLoading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-muted-foreground">No categories found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={(checked) => handleSelectCategory(category.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{category.trainingsCount} total</div>
                                <div className="text-muted-foreground">{category.activeTrainingsCount} active</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={category.isActive ? "default" : "secondary"}>
                                {category.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(category.createdAt).toLocaleDateString()}
                            </TableCell>
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
                                    className="text-destructive"
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
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Training Locations
                </CardTitle>
                <CardDescription>
                  Manage training locations by state and district
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Location Button */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search locations..."
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      className="w-[300px]"
                    />
                    <Select value={locationActiveFilter} onValueChange={setLocationActiveFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Location
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingLocation ? "Edit Location" : "Add New Location"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingLocation ? "Update the location details" : "Create a new training location"}
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
                                  <Input placeholder="State name" {...field} />
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
                                  <Input placeholder="District name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={locationForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Active Status</FormLabel>
                                  <FormDescription>
                                    Enable or disable this location
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
                            <Button type="submit" disabled={locationForm.formState.isSubmitting}>
                              {locationForm.formState.isSubmitting ? "Saving..." : "Save Location"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Locations Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isLocationSelectAll}
                            onCheckedChange={handleSelectAllLocations}
                          />
                        </TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Trainings</TableHead>
                        <TableHead>Status</TableHead>
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
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredLocations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-muted-foreground">No locations found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLocations.map((location) => (
                          <TableRow key={location.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedLocations.includes(location.id)}
                                onCheckedChange={(checked) => handleSelectLocation(location.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{location.state}</TableCell>
                            <TableCell>{location.district}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{location.trainingsCount} total</div>
                                <div className="text-muted-foreground">{location.activeTrainingsCount} active</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={location.isActive ? "default" : "secondary"}>
                                {location.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(location.createdAt).toLocaleDateString()}
                            </TableCell>
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
                                    className="text-destructive"
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
          </TabsContent>

          {/* Stacks Tab */}
          <TabsContent value="stacks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technology Stacks
                </CardTitle>
                <CardDescription>
                  Manage technology stacks and frameworks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Stack Button */}
                <div className="flex justify-between items-center">
                  <Input
                    placeholder="Search stacks..."
                    value={stackSearchTerm}
                    onChange={(e) => setStackSearchTerm(e.target.value)}
                    className="w-[300px]"
                  />
                  <Dialog open={isStackDialogOpen} onOpenChange={setIsStackDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stack
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingStack ? "Edit Stack" : "Add New Stack"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingStack ? "Update the stack details" : "Create a new technology stack"}
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
                                  <Input placeholder="Stack name" {...field} />
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
                                  <Textarea placeholder="Stack description (optional)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter>
                            <Button type="submit" disabled={stackForm.formState.isSubmitting}>
                              {stackForm.formState.isSubmitting ? "Saving..." : "Save Stack"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Stacks Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isStackSelectAll}
                            onCheckedChange={handleSelectAllStacks}
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
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                          </TableRow>
                        ))
                      ) : filteredStacks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No stacks found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStacks.map((stack) => (
                          <TableRow key={stack.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStacks.includes(stack.id)}
                                onCheckedChange={(checked) => handleSelectStack(stack.id, checked as boolean)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{stack.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{stack.description || "No description"}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{stack.trainingsCount} total</div>
                                <div className="text-muted-foreground">{stack.activeTrainingsCount} active</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(stack.createdAt).toLocaleDateString()}
                            </TableCell>
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
                                    className="text-destructive"
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}