"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MapPin, DollarSign, Users, Calendar, Eye, Briefcase, Star, Clock } from "lucide-react"
import { format } from "date-fns"

// Dummy data for freelancer trainings
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
    status: "AVAILABLE",
    applications: 12,
    matchScore: 95,
  },
  {
    id: "2",
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
    isPublished: true,
    isActive: true,
    status: "AVAILABLE",
    applications: 25,
    matchScore: 88,
  },
  {
    id: "3",
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
    status: "COMPLETED",
    applications: 8,
    matchScore: 72,
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
    status: "AVAILABLE",
    applications: 15,
    matchScore: 91,
  },
  {
    id: "5",
    title: "Data Science with R",
    description: "Complete data science course using R programming language",
    companyName: "Data Science Institute",
    stack: "R",
    category: "FUNDAMENTALS",
    type: "UNIVERSITY",
    location: "Chennai, Tamil Nadu",
    startDate: "2024-03-01",
    endDate: "2024-04-01",
    paymentAmount: 80000,
    paymentTerm: 60,
    isPublished: false,
    isActive: true,
    status: "PENDING",
    applications: 18,
    matchScore: 85,
  },
]

const statusColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

export default function FreelancerTrainingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [locationFilter, setLocationFilter] = useState("ALL")
  const [minPaymentFilter, setMinPaymentFilter] = useState("")
  const [maxPaymentFilter, setMaxPaymentFilter] = useState("")
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")

  const filteredTrainings = dummyTrainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "ALL" || training.category === categoryFilter
    const matchesType = typeFilter === "ALL" || training.type === typeFilter
    const matchesLocation = locationFilter === "ALL" || training.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesMinPayment = !minPaymentFilter || training.paymentAmount >= parseInt(minPaymentFilter)
    const matchesMaxPayment = !maxPaymentFilter || training.paymentAmount <= parseInt(maxPaymentFilter)
    
    return matchesSearch && matchesCategory && matchesType && matchesLocation && matchesMinPayment && matchesMaxPayment
  })

  const handleApply = (training) => {
    setSelectedTraining(training)
    setApplicationMessage("")
    setIsApplyDialogOpen(true)
  }

  const submitApplication = () => {
    // Submit application logic would go here
    console.log("Submitting application for training:", {
      trainingId: selectedTraining.id,
      message: applicationMessage,
    })
    setIsApplyDialogOpen(false)
    setSelectedTraining(null)
    setApplicationMessage("")
  }

  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Find Trainings</h1>
          <p className="text-muted-foreground">Search and apply for training opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            My Applications
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.filter(t => t.status === "AVAILABLE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyTrainings.filter(t => t.matchScore >= 90).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{Math.round(dummyTrainings.reduce((sum, t) => sum + t.paymentAmount, 0) / dummyTrainings.length).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Frameworks</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Trainings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="SOFT_SKILLS">Soft Skills</SelectItem>
                <SelectItem value="FUNDAMENTALS">Fundamentals</SelectItem>
                <SelectItem value="FRAMEWORKS">Frameworks</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CORPORATE">Corporate</SelectItem>
                <SelectItem value="UNIVERSITY">University</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Locations</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Pune">Pune</SelectItem>
                <SelectItem value="Chennai">Chennai</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min Payment"
              value={minPaymentFilter}
              onChange={(e) => setMinPaymentFilter(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Payment"
              value={maxPaymentFilter}
              onChange={(e) => setMaxPaymentFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trainings List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Trainings</CardTitle>
          <CardDescription>{filteredTrainings.length} trainings found matching your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{training.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        {training.companyName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{training.category}</Badge>
                      <Badge variant={training.type === "CORPORATE" ? "default" : "secondary"}>
                        {training.type}
                      </Badge>
                      <Badge className={statusColors[training.status]}>
                        {training.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 line-clamp-2">{training.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{training.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(training.startDate), "MMM dd")} - {format(new Date(training.endDate), "MMM dd")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>₹{training.paymentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{training.applications} applications</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Match Score:</span>
                      <span className={`text-lg font-bold ${getMatchScoreColor(training.matchScore)}`}>
                        {training.matchScore}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedTraining(training)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {training.status === "AVAILABLE" && (
                        <Button size="sm" onClick={() => handleApply(training)}>
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Training: {selectedTraining?.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this training opportunity
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Company</Label>
                <p className="text-sm text-muted-foreground">{selectedTraining?.companyName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Payment</Label>
                <p className="text-sm text-muted-foreground">₹{selectedTraining?.paymentAmount?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Duration</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedTraining?.startDate && selectedTraining?.endDate && 
                    `${format(new Date(selectedTraining.startDate), "MMM dd")} - ${format(new Date(selectedTraining.endDate), "MMM dd")}`
                  }
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-muted-foreground">{selectedTraining?.location}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us why you're the perfect fit for this training..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitApplication}>
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}