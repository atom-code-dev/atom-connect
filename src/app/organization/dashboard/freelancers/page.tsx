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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, MapPin, Star, Calendar, Users, Briefcase, Linkedin, Mail, Phone, Eye } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
  name: string
}

// Dummy data for freelancers
const dummyFreelancers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91-9876543210",
    skills: ["React.js", "Node.js", "TypeScript", "MongoDB"],
    trainerType: "CORPORATE",
    experience: "5+ years of experience in full-stack development with expertise in React and Node.js",
    linkedinProfile: "https://linkedin.com/in/johndoe",
    availability: "AVAILABLE",
    location: "Bangalore, Karnataka",
    rating: 4.8,
    completedTrainings: 25,
    profilePicture: "/placeholder-avatar.jpg",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91-9876543211",
    skills: ["Python", "Django", "Machine Learning", "Data Science"],
    trainerType: "UNIVERSITY",
    experience: "8+ years of experience in data science and machine learning",
    linkedinProfile: "https://linkedin.com/in/janesmith",
    availability: "IN_TRAINING",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    completedTrainings: 40,
    profilePicture: "/placeholder-avatar.jpg",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91-9876543212",
    skills: ["Leadership", "Communication", "Team Building", "Project Management"],
    trainerType: "CORPORATE",
    experience: "10+ years of experience in corporate training and leadership development",
    linkedinProfile: "https://linkedin.com/in/bobjohnson",
    availability: "AVAILABLE",
    location: "Delhi, Delhi",
    rating: 4.7,
    completedTrainings: 60,
    profilePicture: "/placeholder-avatar.jpg",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+91-9876543213",
    skills: ["Java", "Spring Boot", "Microservices", "AWS"],
    trainerType: "BOTH",
    experience: "6+ years of experience in enterprise Java development and cloud architecture",
    linkedinProfile: "https://linkedin.com/in/alicebrown",
    availability: "NOT_AVAILABLE",
    location: "Pune, Maharashtra",
    rating: 4.6,
    completedTrainings: 30,
    profilePicture: "/placeholder-avatar.jpg",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    phone: "+91-9876543214",
    skills: ["Angular", "TypeScript", "RxJS", "NgRx"],
    trainerType: "CORPORATE",
    experience: "4+ years of experience in frontend development with Angular",
    linkedinProfile: "https://linkedin.com/in/charliewilson",
    availability: "AVAILABLE",
    location: "Chennai, Tamil Nadu",
    rating: 4.5,
    completedTrainings: 18,
    profilePicture: "/placeholder-avatar.jpg",
  },
]

const availabilityColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  IN_TRAINING: "bg-yellow-100 text-yellow-800",
  NOT_AVAILABLE: "bg-red-100 text-red-800",
}

const trainerTypeColors = {
  CORPORATE: "bg-blue-100 text-blue-800",
  UNIVERSITY: "bg-purple-100 text-purple-800",
  BOTH: "bg-orange-100 text-orange-800",
}

export default function OrganizationFreelancersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [skillsFilter, setSkillsFilter] = useState("ALL")
  const [locationFilter, setLocationFilter] = useState("ALL")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")
  const [trainerTypeFilter, setTrainerTypeFilter] = useState("ALL")
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)

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

  const filteredFreelancers = dummyFreelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         freelancer.experience.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkills = skillsFilter === "ALL" || freelancer.skills.includes(skillsFilter)
    const matchesLocation = locationFilter === "ALL" || freelancer.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesAvailability = availabilityFilter === "ALL" || freelancer.availability === availabilityFilter
    const matchesTrainerType = trainerTypeFilter === "ALL" || freelancer.trainerType === trainerTypeFilter
    
    return matchesSearch && matchesSkills && matchesLocation && matchesAvailability && matchesTrainerType
  })

  const allSkills = Array.from(new Set(dummyFreelancers.flatMap(f => f.skills)))
  const allLocations = Array.from(new Set(dummyFreelancers.map(f => f.location.split(", ")[1])))

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Find Trainers</h1>
          <p className="text-muted-foreground">Search and connect with expert trainers</p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Contact Selected
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyFreelancers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dummyFreelancers.filter(f => f.availability === "AVAILABLE").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(dummyFreelancers.reduce((sum, f) => sum + f.rating, 0) / dummyFreelancers.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">React.js</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Trainers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={skillsFilter} onValueChange={setSkillsFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Skills" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Skills</SelectItem>
                {allSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Locations</SelectItem>
                {allLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Availability</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="IN_TRAINING">In Training</SelectItem>
                <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trainerTypeFilter} onValueChange={setTrainerTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trainer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CORPORATE">Corporate</SelectItem>
                <SelectItem value="UNIVERSITY">University</SelectItem>
                <SelectItem value="BOTH">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainers List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Trainers</CardTitle>
          <CardDescription>{filteredFreelancers.length} trainers found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {freelancer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{freelancer.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{freelancer.rating}</span>
                          <span className="text-sm text-muted-foreground">({freelancer.completedTrainings} trainings)</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={availabilityColors[freelancer.availability]}>
                      {freelancer.availability.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{freelancer.location}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4" />
                        <span className="font-medium">Skills:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <Badge className={trainerTypeColors[freelancer.trainerType]}>
                        {freelancer.trainerType}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {freelancer.experience}
                    </p>

                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedFreelancer(freelancer)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>{freelancer.name} - Profile</DialogTitle>
                            <DialogDescription>Detailed trainer information</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <p className="text-sm text-muted-foreground">{freelancer.email}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Phone</Label>
                                <p className="text-sm text-muted-foreground">{freelancer.phone}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Location</Label>
                              <p className="text-sm text-muted-foreground">{freelancer.location}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Experience</Label>
                              <p className="text-sm text-muted-foreground">{freelancer.experience}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Skills</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {freelancer.skills.map(skill => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">Trainer Type</Label>
                                <Badge className={trainerTypeColors[freelancer.trainerType]}>
                                  {freelancer.trainerType}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Availability</Label>
                                <Badge className={availabilityColors[freelancer.availability]}>
                                  {freelancer.availability.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">LinkedIn Profile</Label>
                              <a href={freelancer.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                {freelancer.linkedinProfile}
                              </a>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}