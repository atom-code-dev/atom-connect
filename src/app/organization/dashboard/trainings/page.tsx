"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Calendar as CalendarIcon, MapPin, DollarSign, Users } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  email: string
  role: string
  name: string
}

// Dummy data for organization trainings
const dummyTrainings = [
  {
    id: "1",
    title: "React.js Advanced Training",
    description: "Learn advanced React concepts including hooks, context, and performance optimization",
    companyName: "TechCorp Solutions",
    stack: "React.js",
    category: "FRAMEWORKS",
    type: "CORPORATE",
    location: "Bangalore, Karnataka",
    startDate: "2024-02-15",
    endDate: "2024-02-20",
    paymentAmount: 50000,
    paymentTerm: 30,
    isPublished: true,
    isActive: true,
    applications: 12,
    status: "ACTIVE",
  },
  {
    id: "2",
    title: "Leadership & Communication Skills",
    description: "Develop essential soft skills for leadership roles in corporate environment",
    companyName: "Leadership Academy",
    stack: "Soft Skills",
    category: "SOFT_SKILLS",
    type: "CORPORATE",
    location: "Mumbai, Maharashtra",
    startDate: "2024-02-10",
    endDate: "2024-02-12",
    paymentAmount: 35000,
    paymentTerm: 15,
    isPublished: true,
    isActive: false,
    applications: 8,
    status: "COMPLETED",
  },
  {
    id: "3",
    title: "Python Fundamentals Course",
    description: "Comprehensive Python programming course for beginners and intermediate learners",
    companyName: "Code University",
    stack: "Python",
    category: "FUNDAMENTALS",
    type: "UNIVERSITY",
    location: "Delhi, Delhi",
    startDate: "2024-02-20",
    endDate: "2024-03-20",
    paymentAmount: 75000,
    paymentTerm: 45,
    isPublished: false,
    isActive: true,
    applications: 25,
    status: "DRAFT",
  },
  {
    id: "4",
    title: "Node.js Backend Development",
    description: "Master backend development with Node.js, Express, and MongoDB",
    companyName: "DevWorks Inc.",
    stack: "Node.js",
    category: "FRAMEWORKS",
    type: "CORPORATE",
    location: "Pune, Maharashtra",
    startDate: "2024-02-25",
    endDate: "2024-03-05",
    paymentAmount: 60000,
    paymentTerm: 30,
    isPublished: true,
    isActive: true,
    applications: 15,
    status: "ACTIVE",
  },
]

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  DRAFT: "bg-gray-100 text-gray-800",
}

export default function OrganizationTrainingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    category: "",
    type: "",
    location: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    paymentAmount: "",
    paymentTerm: "",
    isPublished: false,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (status === "authenticated" && session?.user?.role !== "ORGANIZATION") {
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

  if (!session || session.user.role !== "ORGANIZATION") {
    return null
  }

  const user = session.user

  const filteredTrainings = dummyTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || training.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (training) => {
    setEditingTraining(training)
    setFormData({
      title: training.title,
      description: training.description,
      skills: training.skills.join(", "),
      category: training.category,
      type: training.type,
      location: training.location,
      startDate: new Date(training.startDate),
      endDate: new Date(training.endDate),
      paymentAmount: training.paymentAmount.toString(),
      paymentTerm: training.paymentTerm.toString(),
      isPublished: training.isPublished,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    // Save logic would go here
    console.log("Saving training:", formData)
    setIsDialogOpen(false)
    setEditingTraining(null)
    setFormData({
      title: "",
      description: "",
      skills: "",
      category: "",
      type: "",
      location: "",
      startDate: undefined,
      endDate: undefined,
      paymentAmount: "",
      paymentTerm: "",
      isPublished: false,
    })
  }

  const handleDelete = (trainingId) => {
    // Delete logic would go here
    console.log("Deleting training:", trainingId)
  }

  const handleExportCSV = () => {
    // CSV export logic would go here
    console.log("Exporting trainings to CSV...")
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground">Create and manage your training postings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Training
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTraining ? "Edit Training" : "Create New Training"}
                </DialogTitle>
                <DialogDescription>
                  {editingTraining 
                    ? "Update the training information."
                    : "Create a new training posting to find expert trainers."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="col-span-3"
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
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skills" className="text-right">
                    Skills
                  </Label>
                  <Input
                    id="skills"
                    placeholder="Comma-separated skills"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOFT_SKILLS">Soft Skills</SelectItem>
                      <SelectItem value="FUNDAMENTALS">Fundamentals</SelectItem>
                      <SelectItem value="FRAMEWORKS">Frameworks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORPORATE">Corporate</SelectItem>
                      <SelectItem value="UNIVERSITY">University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="col-span-3 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => setFormData({ ...formData, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="col-span-3 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => setFormData({ ...formData, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentAmount" className="text-right">
                    Payment
                  </Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentTerm" className="text-right">
                    Term (days)
                  </Label>
                  <Input
                    id="paymentTerm"
                    type="number"
                    value={formData.paymentTerm}
                    onChange={(e) => setFormData({ ...formData, paymentTerm: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingTraining ? "Update" : "Create"}
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
            <CardTitle className="text-sm font-medium">Total Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.filter(t => t.status === "ACTIVE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.reduce((sum, t) => sum + t.applications, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.filter(t => t.isPublished).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Trainings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trainings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Trainings</CardTitle>
          <CardDescription>Manage all your training postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>{training.category}</TableCell>
                    <TableCell>{training.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{training.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{training.paymentAmount.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{training.applications}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[training.status]}>
                        {training.status}
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Training
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Applications
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(training.id)}
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
      </div>
    </DashboardLayout>
  )
}