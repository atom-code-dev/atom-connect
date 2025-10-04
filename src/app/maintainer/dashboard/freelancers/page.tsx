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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, Eye, Users, Star, MapPin } from "lucide-react"
import HexagonLoader from "@/components/ui/hexagon-loader"

interface Freelancer {
  id: string
  name: string
  email: string
  phone?: string
  skills: string[]
  trainerType: "CORPORATE" | "UNIVERSITY" | "BOTH"
  experience: string
  linkedinProfile?: string
  availability: "AVAILABLE" | "IN_TRAINING" | "NOT_AVAILABLE"
  location: string
  rating: number
  completedTrainings: number
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

interface FreelancersResponse {
  freelancers: Freelancer[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

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

export default function MaintainerFreelancersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")
  const [trainerTypeFilter, setTrainerTypeFilter] = useState("ALL")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/")
      return
    }
    
    if (session.user?.role !== "MAINTAINER") {
      router.push("/")
      return
    }

    fetchFreelancers()
  }, [session, status, router])

  useEffect(() => {
    if (session) {
      fetchFreelancers()
    }
  }, [searchTerm, availabilityFilter, trainerTypeFilter, pagination.page])

  const fetchFreelancers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        trainerType: trainerTypeFilter === "ALL" ? "" : trainerTypeFilter,
        availability: availabilityFilter === "ALL" ? "" : availabilityFilter,
      })

      const response = await fetch(`/api/freelancers?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch freelancers")
      }
      
      const data: FreelancersResponse = await response.json()
      setFreelancers(data.freelancers)
      setPagination(data.pagination)
    } catch (err) {
      console.error("Error fetching freelancers:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const filteredFreelancers = freelancers

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HexagonLoader size={80} />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchFreelancers}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole={session.user?.role || ""} userName={session.user?.name || ""}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Freelancers Directory</h1>
            <p className="text-muted-foreground">View and manage freelancer profiles</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freelancers.filter(f => f.availability === "IN_TRAINING").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freelancers.filter(f => f.availability === "AVAILABLE").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(freelancers.reduce((sum, f) => sum + f.rating, 0) / freelancers.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Freelancers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search freelancers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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

        {/* Freelancers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Freelancers Directory</CardTitle>
            <CardDescription>View freelancer profiles and information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFreelancers.map((freelancer) => (
                    <TableRow key={freelancer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {freelancer.name}
                        </div>
                      </TableCell>
                      <TableCell>{freelancer.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {freelancer.skills.slice(0, 2).map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {freelancer.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{freelancer.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={trainerTypeColors[freelancer.trainerType]}>
                          {freelancer.trainerType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{freelancer.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{freelancer.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <Users className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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