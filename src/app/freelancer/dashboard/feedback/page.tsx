"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Star, Building, Calendar, TrendingUp, Award, MessageSquare, Eye, Filter } from "lucide-react"

// Dummy data for freelancer feedback
const feedbackData = {
  overallStats: {
    totalRatings: 45,
    averageRating: 4.7,
    responseRate: 95,
    completionRate: 98,
  },
  ratingBreakdown: {
    organizationRating: 4.8,
    overallRating: 4.7,
    foodAccommodation: 4.5,
    travelExperience: 4.6,
    paymentTermRating: 4.8,
  },
  recentFeedback: [
    {
      id: "1",
      trainingTitle: "React.js Advanced Training",
      companyName: "TechCorp Solutions",
      submissionDate: "2024-01-20",
      organizationRating: 5,
      overallRating: 5,
      foodAccommodation: 4,
      travelExperience: 5,
      paymentTermRating: 5,
      comments: "Excellent training delivery! Very knowledgeable and engaging. The participants learned a lot and gave great feedback.",
      status: "COMPLETED",
    },
    {
      id: "2",
      trainingTitle: "Python Fundamentals Course",
      companyName: "Code University",
      submissionDate: "2024-01-15",
      organizationRating: 4,
      overallRating: 4,
      foodAccommodation: 5,
      travelExperience: 4,
      paymentTermRating: 4,
      comments: "Good training session. Covered all the basics well. Some advanced topics could have been explained in more detail.",
      status: "COMPLETED",
    },
    {
      id: "3",
      trainingTitle: "Leadership & Communication Skills",
      companyName: "Leadership Academy",
      submissionDate: "2024-01-10",
      organizationRating: 5,
      overallRating: 5,
      foodAccommodation: 5,
      travelExperience: 5,
      paymentTermRating: 5,
      comments: "Outstanding facilitator! Made the session very interactive and practical. Highly recommended.",
      status: "COMPLETED",
    },
  ],
  pendingFeedback: [
    {
      id: "4",
      trainingTitle: "Node.js Backend Development",
      companyName: "DevWorks Inc.",
      submissionDate: "2024-01-25",
      status: "PENDING",
    },
  ],
  achievements: [
    {
      id: "1",
      title: "Top Rated Trainer",
      description: "Maintained 4.8+ average rating for 6 consecutive months",
      date: "2024-01-15",
      icon: "🏆",
    },
    {
      id: "2",
      title: "100+ Trainings",
      description: "Completed over 100 training sessions",
      date: "2024-01-01",
      icon: "🎯",
    },
    {
      id: "3",
      title: "Excellent Communicator",
      description: "Received perfect scores in communication feedback",
      date: "2023-12-15",
      icon: "💬",
    },
  ],
}

export default function FreelancerFeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)

  const handleViewFeedback = (feedback: any) => {
    setSelectedFeedback(feedback)
    setIsFeedbackDialogOpen(true)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Feedback</h1>
          <p className="text-muted-foreground">View your training feedback and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackData.overallStats.totalRatings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{feedbackData.overallStats.averageRating}</div>
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackData.overallStats.responseRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackData.overallStats.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Rating Breakdown
          </CardTitle>
          <CardDescription>Detailed breakdown of your performance ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="mb-2">
                {renderStars(feedbackData.ratingBreakdown.organizationRating)}
              </div>
              <p className="text-sm font-medium">Organization</p>
            </div>
            <div className="text-center">
              <div className="mb-2">
                {renderStars(feedbackData.ratingBreakdown.overallRating)}
              </div>
              <p className="text-sm font-medium">Overall</p>
            </div>
            <div className="text-center">
              <div className="mb-2">
                {renderStars(feedbackData.ratingBreakdown.foodAccommodation)}
              </div>
              <p className="text-sm font-medium">Food & Accommodation</p>
            </div>
            <div className="text-center">
              <div className="mb-2">
                {renderStars(feedbackData.ratingBreakdown.travelExperience)}
              </div>
              <p className="text-sm font-medium">Travel Experience</p>
            </div>
            <div className="text-center">
              <div className="mb-2">
                {renderStars(feedbackData.ratingBreakdown.paymentTermRating)}
              </div>
              <p className="text-sm font-medium">Payment Terms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="completed" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="completed">
                Completed ({feedbackData.recentFeedback.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({feedbackData.pendingFeedback.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Feedback</CardTitle>
                  <CardDescription>Feedback from your completed training sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackData.recentFeedback.map((feedback) => (
                      <div key={feedback.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium">{feedback.trainingTitle}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-4 w-4" />
                              <span>{feedback.companyName}</span>
                              <Calendar className="h-4 w-4 ml-2" />
                              <span>{new Date(feedback.submissionDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge variant="outline">{feedback.status}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Organization</p>
                            {renderStars(feedback.organizationRating)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Overall</p>
                            {renderStars(feedback.overallRating)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Food & Acc.</p>
                            {renderStars(feedback.foodAccommodation)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Travel</p>
                            {renderStars(feedback.travelExperience)}
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Payment</p>
                            {renderStars(feedback.paymentTermRating)}
                          </div>
                        </div>

                        {feedback.comments && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Comments:</p>
                            <p className="text-sm">{feedback.comments}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleViewFeedback(feedback)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Feedback</CardTitle>
                  <CardDescription>Trainings awaiting your feedback submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedbackData.pendingFeedback.map((feedback) => (
                      <div key={feedback.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{feedback.trainingTitle}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span>{feedback.companyName}</span>
                            <Calendar className="h-4 w-4 ml-2" />
                            <span>{new Date(feedback.submissionDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{feedback.status}</Badge>
                          <Button size="sm">
                            Submit Feedback
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Achievements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>Your recent accomplishments and recognition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.achievements.map((achievement) => (
                  <div key={achievement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Tips
              </CardTitle>
              <CardDescription>Suggestions to improve your ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Focus on interactive sessions to increase engagement</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Provide more real-world examples and case studies</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Improve time management during training sessions</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">Submit feedback promptly after training completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feedback Detail Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Training Feedback Details</DialogTitle>
            <DialogDescription>
              Detailed feedback for {selectedFeedback?.trainingTitle}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Training</Label>
                  <p className="text-sm text-muted-foreground">{selectedFeedback.trainingTitle}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <p className="text-sm text-muted-foreground">{selectedFeedback.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submission Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedFeedback.submissionDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline">{selectedFeedback.status}</Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Rating Breakdown</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Organization Rating:</span>
                    {renderStars(selectedFeedback.organizationRating)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Rating:</span>
                    {renderStars(selectedFeedback.overallRating)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Food & Accommodation:</span>
                    {renderStars(selectedFeedback.foodAccommodation)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Travel Experience:</span>
                    {renderStars(selectedFeedback.travelExperience)}
                  </div>
                  <div className="flex justify-between items-center col-span-2">
                    <span className="text-sm">Payment Terms:</span>
                    {renderStars(selectedFeedback.paymentTermRating)}
                  </div>
                </div>
              </div>

              {selectedFeedback.comments && (
                <div>
                  <Label className="text-sm font-medium">Comments</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedFeedback.comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}