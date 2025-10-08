import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user?.role !== "MAINTAINER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeFilter = searchParams.get("timeFilter") || "12months"
    const typeFilter = searchParams.get("typeFilter") || "ALL"

    // Calculate date range based on time filter
    const now = new Date()
    let startDate = new Date()
    
    switch (timeFilter) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3months":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6months":
        startDate.setMonth(now.getMonth() - 6)
        break
      case "12months":
      default:
        startDate.setMonth(now.getMonth() - 12)
        break
    }

    // Generate monthly data for the last 12 months
    const monthlyData: Array<{
      month: string;
      totalReviews: number;
      approvedReviews: number;
      rejectedReviews: number;
      pendingReviews: number;
    }> = []
    const currentDate = new Date(startDate)
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      // Count reviews for this month
      const [organizationReviews, freelancerReviews] = await Promise.all([
        db.organizationProfile.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        db.freelancerProfile.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ])
      
      // For demo purposes, we'll simulate some review data
      // In a real app, you would have actual review records
      const totalReviews = organizationReviews + freelancerReviews
      const approvedReviews = Math.floor(totalReviews * 0.7) // 70% approval rate
      const rejectedReviews = Math.floor(totalReviews * 0.2) // 20% rejection rate
      const pendingReviews = totalReviews - approvedReviews - rejectedReviews
      
      monthlyData.push({
        month: monthName,
        totalReviews,
        approvedReviews,
        rejectedReviews,
        pendingReviews
      })
      
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Get review history - only approved organizations (no freelancer approvals needed)
    const reviewHistory: Array<{
      id: string;
      type: "ORGANIZATION";
      entityName: string;
      status: string;
      reviewedBy: string;
      reviewedAt: string;
      comments: string;
    }> = []
    
    // Get approved organizations as review history
    const approvedOrganizations = await db.organizationProfile.findMany({
      where: {
        verifiedStatus: "VERIFIED",
        ...(typeFilter === "ALL" ? {} : { type: typeFilter as any })
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc' // Use updatedAt to show when it was last modified/approved
      },
      take: 30
    })

    approvedOrganizations.forEach(org => {
      reviewHistory.push({
        id: `org-${org.id}`,
        type: "ORGANIZATION" as const,
        entityName: org.organizationName,
        status: "APPROVED",
        reviewedBy: session.user?.name || "Current Maintainer",
        reviewedAt: org.updatedAt.toISOString(),
        comments: "Organization verification approved"
      })
    })

    // Sort review history by date
    reviewHistory.sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime())

    // Calculate summary statistics
    const totalReviews = monthlyData.reduce((sum, month) => sum + month.totalReviews, 0)
    const approvedReviews = monthlyData.reduce((sum, month) => sum + month.approvedReviews, 0)
    const rejectedReviews = monthlyData.reduce((sum, month) => sum + month.rejectedReviews, 0)
    const pendingReviews = monthlyData.reduce((sum, month) => sum + month.pendingReviews, 0)
    const averageReviewTime = 24 // Simulated average review time in hours

    const summary = {
      totalReviews,
      approvedReviews,
      rejectedReviews,
      pendingReviews,
      averageReviewTime
    }

    return NextResponse.json({
      monthlyData,
      reviewHistory: reviewHistory.slice(0, 20), // Limit to 20 items
      summary
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}