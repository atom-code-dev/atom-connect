"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, XCircle, Calendar as CalendarIcon, Plus, Edit, Trash2 } from "lucide-react"

// Dummy data for freelancer availability
const availabilityData = {
  currentStatus: "AVAILABLE",
  statusHistory: [
    {
      id: "1",
      status: "AVAILABLE",
      startDate: "2024-01-15",
      endDate: null,
      reason: "Ready for new training opportunities",
    },
    {
      id: "2",
      status: "IN_TRAINING",
      startDate: "2024-01-01",
      endDate: "2024-01-14",
      reason: "Conducting React.js training for TechCorp",
    },
    {
      id: "3",
      status: "AVAILABLE",
      startDate: "2023-12-15",
      endDate: "2023-12-31",
      reason: "Available for short-term trainings",
    },
  ],
  upcomingUnavailability: [
    {
      id: "1",
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      reason: "Personal vacation",
      status: "SCHEDULED",
    },
  ],
  currentTrainings: [
    {
      id: "1",
      title: "React.js Advanced Training",
      companyName: "TechCorp Solutions",
      startDate: "2024-02-15",
      endDate: "2024-02-20",
      status: "UPCOMING",
    },
  ],
}

const statusColors = {
  AVAILABLE: "bg-green-100 text-green-800",
  IN_TRAINING: "bg-yellow-100 text-yellow-800",
  NOT_AVAILABLE: "bg-red-100 text-red-800",
}

const statusIcons = {
  AVAILABLE: <CheckCircle className="h-5 w-5 text-green-600" />,
  IN_TRAINING: <Clock className="h-5 w-5 text-yellow-600" />,
  NOT_AVAILABLE: <XCircle className="h-5 w-5 text-red-600" />,
}

export default function FreelancerAvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusReason, setStatusReason] = useState("")
  const [unavailabilityForm, setUnavailabilityForm] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: "",
  })

  const handleStatusChange = () => {
    // Handle status change logic
    console.log("Changing status to:", newStatus, "Reason:", statusReason)
    setIsStatusDialogOpen(false)
    setNewStatus("")
    setStatusReason("")
  }

  const handleAddUnavailability = () => {
    // Handle adding unavailability period
    console.log("Adding unavailability:", unavailabilityForm)
    setIsUnavailabilityDialogOpen(false)
    setUnavailabilityForm({
      startDate: undefined,
      endDate: undefined,
      reason: "",
    })
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "You are available for new training opportunities"
      case "IN_TRAINING":
        return "You are currently conducting training and not available for new opportunities"
      case "NOT_AVAILABLE":
        return "You are not available for training opportunities at this time"
      default:
        return "Status not set"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Availability Management</h1>
          <p className="text-muted-foreground">Manage your availability and training schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsStatusDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Update Status
          </Button>
          <Button onClick={() => setIsUnavailabilityDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Unavailability
          </Button>
        </div>
      </div>

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {statusIcons[availabilityData.currentStatus]}
            Current Availability Status
          </CardTitle>
          <CardDescription>
            {getStatusDescription(availabilityData.currentStatus)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={statusColors[availabilityData.currentStatus]} variant="outline">
                {availabilityData.currentStatus.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">Jan 15, 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availabilityData.currentTrainings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availabilityData.upcomingUnavailability.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>View your availability and training schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              required={false}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">In Training</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Unavailable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Trainings */}
        <Card>
          <CardHeader>
            <CardTitle>Current Trainings</CardTitle>
            <CardDescription>Trainings you are currently conducting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availabilityData.currentTrainings.map((training) => (
                <div key={training.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{training.title}</h3>
                    <Badge variant="outline">{training.status}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{training.companyName}</p>
                    <p>{new Date(training.startDate).toLocaleDateString()} - {new Date(training.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {availabilityData.currentTrainings.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No current trainings
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status History and Unavailability */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Status History</TabsTrigger>
          <TabsTrigger value="unavailability">Upcoming Unavailability</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Your availability status changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availabilityData.statusHistory.map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {statusIcons[history.status]}
                      <div>
                        <h3 className="font-medium">{history.status.replace('_', ' ')}</h3>
                        <p className="text-sm text-muted-foreground">{history.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(history.startDate).toLocaleDateString()}
                        {history.endDate && ` - ${new Date(history.endDate).toLocaleDateString()}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {history.endDate ? "Period" : "Ongoing"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unavailability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Unavailability</CardTitle>
              <CardDescription>Periods when you won't be available for training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availabilityData.upcomingUnavailability.map((unavailability) => (
                  <div key={unavailability.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <h3 className="font-medium">{unavailability.reason}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(unavailability.startDate).toLocaleDateString()} - {new Date(unavailability.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{unavailability.status}</Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {availabilityData.upcomingUnavailability.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No upcoming unavailability periods
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Availability Status</DialogTitle>
            <DialogDescription>
              Change your current availability status
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="IN_TRAINING">In Training</SelectItem>
                  <SelectItem value="NOT_AVAILABLE">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Reason for status change..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange} disabled={!newStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Unavailability Dialog */}
      <Dialog open={isUnavailabilityDialogOpen} onOpenChange={setIsUnavailabilityDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Unavailability Period</DialogTitle>
            <DialogDescription>
              Add a period when you won't be available for training
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <input
                type="date"
                id="startDate"
                value={unavailabilityForm.startDate ? unavailabilityForm.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setUnavailabilityForm({...unavailabilityForm, startDate: new Date(e.target.value)})}
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <input
                type="date"
                id="endDate"
                value={unavailabilityForm.endDate ? unavailabilityForm.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setUnavailabilityForm({...unavailabilityForm, endDate: new Date(e.target.value)})}
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Reason for unavailability..."
                value={unavailabilityForm.reason}
                onChange={(e) => setUnavailabilityForm({...unavailabilityForm, reason: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnavailabilityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUnavailability} disabled={!unavailabilityForm.startDate || !unavailabilityForm.endDate || !unavailabilityForm.reason}>
              Add Period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}