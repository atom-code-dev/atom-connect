import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

// GET maintainer dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.MAINTAINER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get maintainer's user ID
    const maintainerId = session.user.id

    // Calculate dashboard stats
    const [
      pendingReviews,
      activeTrainings,
      totalOrganizations,
      totalFreelancers,
      completedReviews,
      recentReviews,
      pendingItems
    ] = await Promise.all([
      // Pending reviews count
      db.training.count({
        where: {
          isPublished: true,
          isActive: true,
          freelancerId: null // Trainings that haven't been assigned to a freelancer
        }
      }),

      // Active trainings count
      db.training.count({
        where: {
          isPublished: true,
          isActive: true,
          startDate: {
            gte: new Date()
          }
        }
      }),

      // Total organizations count
      db.organizationProfile.count({
        where: {
          user: {
            role: UserRole.ORGANIZATION
          }
        }
      }),

      // Total freelancers count
      db.freelancerProfile.count({
        where: {
          user: {
            role: UserRole.FREELANCER
          }
        }
      }),

      // Completed reviews by this maintainer
      db.trainingFeedback.count({
        where: {
          userId: maintainerId
        }
      }),

      // Recent reviews by this maintainer
      db.trainingFeedback.findMany({
        where: {
          userId: maintainerId
        },
        include: {
          training: {
            select: {
              title: true,
              organization: {
                select: {
                  organizationName: true
                }
              }
            }
          },
          user: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      }),

      // Pending items that need review
      db.$queryRaw`
        SELECT 
          'organization' as type,
          o.id,
          o.organization_name as name,
          o.created_at as "submittedDate",
          o.verified_status as status,
          u.name as "submittedBy",
          u.email as "submittedByEmail"
        FROM organization_profiles o
        JOIN users u ON o.user_id = u.id
        WHERE o.verified_status = 'PENDING'
        
        UNION ALL
        
        SELECT 
          'training' as type,
          t.id,
          t.title as name,
          t.created_at as "submittedDate",
          CASE WHEN t.is_published = false THEN 'PENDING' ELSE 'PUBLISHED' END as status,
          org.organization_name as "submittedBy",
          u.email as "submittedByEmail"
        FROM trainings t
        JOIN organization_profiles org ON t.organization_id = org.id
        JOIN users u ON org.user_id = u.id
        WHERE t.is_published = false
        
        UNION ALL
        
        SELECT 
          'freelancer' as type,
          f.id,
          f.name as name,
          f.created_at as "submittedDate",
          CASE WHEN f.profile_completed = false THEN 'PENDING' ELSE 'COMPLETED' END as status,
          f.name as "submittedBy",
          u.email as "submittedByEmail"
        FROM freelancer_profiles f
        JOIN users u ON f.user_id = u.id
        WHERE f.profile_completed = false
        
        ORDER BY "submittedDate" DESC
        LIMIT 20
      ` as Array<{
        type: string
        id: string
        name: string
        submittedDate: Date
        status: string
        submittedBy: string
        submittedByEmail: string
      }>
    ])

    // Calculate average review time (simplified - would need more complex logic in production)
    const averageReviewTime = "2.5 hours"

    // Format recent reviews
    const formattedRecentReviews = recentReviews.map(review => ({
      id: review.id,
      type: "training",
      name: review.training?.title || "Unknown Training",
      action: "Training Review",
      status: "COMPLETED",
      time: formatTimeAgo(review.createdAt),
      reviewer: review.user?.name || "Unknown"
    }))

    // Format pending items with priority logic
    const formattedPendingItems = pendingItems.map((item, index) => {
      // Simple priority assignment based on type and age
      const daysSinceSubmission = Math.floor((new Date().getTime() - new Date(item.submittedDate).getTime()) / (1000 * 60 * 60 * 24))
      let priority = "MEDIUM"
      
      if (daysSinceSubmission > 7) priority = "HIGH"
      else if (daysSinceSubmission < 3) priority = "LOW"

      return {
        id: item.id,
        type: item.type,
        name: item.name,
        submittedBy: item.submittedBy,
        submittedDate: item.submittedDate.toISOString(),
        priority: priority
      }
    })

    return NextResponse.json({
      stats: {
        pendingReviews,
        activeTrainings,
        organizations: totalOrganizations,
        freelancers: totalFreelancers,
        completedReviews,
        averageReviewTime
      },
      recentReviews: formattedRecentReviews,
      pendingItems: formattedPendingItems
    })

  } catch (error) {
    console.error("Error fetching maintainer dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`
}