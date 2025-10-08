"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Star, Clock, CheckCircle, XCircle, Calendar, Filter } from "lucide-react"
import HexagonLoader from "@/components/ui/hexagon-loader"

interface ReviewData {
  month: string
  totalReviews: number
  approvedReviews: number
  rejectedReviews: number
  pendingReviews: number
}

interface ReviewHistory {
  id: string
  type: "ORGANIZATION" | "FREELANCER"
  entityName: string
  status: "APPROVED" | "REJECTED" | "PENDING"
  reviewedBy: string
  reviewedAt: string
  comments?: string
}

interface AnalyticsResponse {
  monthlyData: ReviewData[]
  reviewHistory: ReviewHistory[]
  summary: {
    totalReviews: number
    approvedReviews: number
    rejectedReviews: number
    pendingReviews: number
    averageReviewTime: number
  }
}

const statusColors = {
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
}

const statusIcons = {
  APPROVED: <CheckCircle className="h-4 w-4 text-green-600" />,
  REJECTED: <XCircle className="h-4 w-4 text-red-600" />,
  PENDING: <Clock className="h-4 w-4 text-yellow-600" />,
}

const chartConfig = {
  totalReviews: {
    label: "Total Reviews",
    color: "hsl(var(--chart-1))",
  },
  approvedReviews: {
    label: "Approved",
    color: "hsl(var(--chart-2))",
  },
  rejectedReviews: {
    label: "Rejected",
    color: "hsl(var(--chart-3))",
  },
  pendingReviews: {
    label: "Pending",
    color: "hsl(var(--chart-4))",
  },
}

export default function MaintainerAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState("12months")
  const [typeFilter, setTypeFilter] = useState("ALL")

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

    fetchAnalyticsData()
  }, [session, status, router, timeFilter, typeFilter])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeFilter,
        typeFilter,
      })

      const response = await fetch(`/api/maintainer/analytics?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      
      const data: AnalyticsResponse = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      console.error("Error fetching analytics data:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

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
          <Button onClick={fetchAnalyticsData}>Retry</Button>
        </div>
      </div>
    )
  }

  const summary = analyticsData?.summary || {
    totalReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
    pendingReviews: 0,
    averageReviewTime: 0,
  }

  return (
    <DashboardLayout userRole={session.user?.role || ""} userName={session.user?.name || ""}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Review insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="ORGANIZATION">Organizations</SelectItem>
                <SelectItem value="FREELANCER">Freelancers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                {timeFilter === "12months" ? "Last 12 months" : timeFilter === "1month" ? "Last month" : `Last ${timeFilter.replace("months", " months")}`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.approvedReviews}</div>
              <p className="text-xs text-muted-foreground">
                {summary.totalReviews > 0 ? Math.round((summary.approvedReviews / summary.totalReviews) * 100) : 0}% approval rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.rejectedReviews}</div>
              <p className="text-xs text-muted-foreground">
                {summary.totalReviews > 0 ? Math.round((summary.rejectedReviews / summary.totalReviews) * 100) : 0}% rejection rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                {summary.totalReviews > 0 ? Math.round((summary.pendingReviews / summary.totalReviews) * 100) : 0}% pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Review Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.averageReviewTime}h</div>
              <p className="text-xs text-muted-foreground">
                Average processing time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Reviews Chart - Full Width */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Monthly Reviews Trend</CardTitle>
            <CardDescription>Review activity over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={analyticsData?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="totalReviews" fill="var(--color-totalReviews)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approvedReviews" fill="var(--color-approvedReviews)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejectedReviews" fill="var(--color-rejectedReviews)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendingReviews" fill="var(--color-pendingReviews)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Review History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Approved Reviews</CardTitle>
            <CardDescription>Organizations you have approved (freelancers don't require approval)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead>Reviewed At</TableHead>
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData?.reviewHistory?.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {review.type === "ORGANIZATION" ? "Organization" : "Freelancer"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{review.entityName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {statusIcons[review.status]}
                          <Badge className={statusColors[review.status]}>
                            {review.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{review.reviewedBy}</TableCell>
                      <TableCell>{new Date(review.reviewedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.comments || "-"}
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