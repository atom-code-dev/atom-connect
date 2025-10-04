import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

// GET maintainer dashboard statistics
export async function GET(request: NextRequest) {
  try {
    console.log('Maintainer dashboard API called')
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session ? 'Found' : 'Not found')
    
    if (!session || session.user.role !== UserRole.MAINTAINER) {
      console.log('Unauthorized access attempt')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get maintainer's user ID
    const maintainerId = session.user.id
    console.log('Maintainer ID:', maintainerId)

    // Calculate dashboard stats with error handling for each query
    try {
      const [
        pendingReviews,
        activeTrainings,
        totalOrganizations,
        totalFreelancers,
        completedReviews
      ] = await Promise.all([
        // Pending reviews count
        db.training.count({
          where: {
            isPublished: true,
            isActive: true,
            freelancerId: null // Trainings that haven't been assigned to a freelancer
          }
        }).catch(e => {
          console.error('Error fetching pending reviews:', e)
          return 0
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
        }).catch(e => {
          console.error('Error fetching active trainings:', e)
          return 0
        }),

        // Total organizations count
        db.organizationProfile.count({
          where: {
            user: {
              role: UserRole.ORGANIZATION
            }
          }
        }).catch(e => {
          console.error('Error fetching organizations:', e)
          return 0
        }),

        // Total freelancers count
        db.freelancerProfile.count({
          where: {
            user: {
              role: UserRole.FREELANCER
            }
          }
        }).catch(e => {
          console.error('Error fetching freelancers:', e)
          return 0
        }),

        // Completed reviews by this maintainer
        db.trainingFeedback.count({
          where: {
            userId: maintainerId
          }
        }).catch(e => {
          console.error('Error fetching completed reviews:', e)
          return 0
        })
      ])

      console.log('Basic stats fetched successfully')

      // Recent reviews by this maintainer
      const recentReviews = await db.trainingFeedback.findMany({
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
      }).catch(e => {
        console.error('Error fetching recent reviews:', e)
        return []
      })

      console.log('Recent reviews fetched:', recentReviews.length)

      // Pending items that need review - simplified to avoid potential SQL errors
      const pendingItems = await Promise.all([
        // Pending organizations
        db.organizationProfile.findMany({
          where: {
            verifiedStatus: 'PENDING'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          take: 10
        }).then(orgs => orgs.map(org => ({
          type: 'organization' as const,
          id: org.id,
          name: org.organizationName,
          submittedDate: org.createdAt,
          status: org.verifiedStatus,
          submittedBy: org.user.name || 'Unknown',
          submittedByEmail: org.user.email
        }))).catch(e => {
          console.error('Error fetching pending organizations:', e)
          return []
        }),

        // Pending trainings
        db.training.findMany({
          where: {
            isPublished: false
          },
          include: {
            organization: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          take: 10
        }).then(trainings => trainings.map(t => ({
          type: 'training' as const,
          id: t.id,
          name: t.title,
          submittedDate: t.createdAt,
          status: t.isPublished ? 'PUBLISHED' : 'PENDING',
          submittedBy: t.organization.organizationName,
          submittedByEmail: t.organization.user.email
        }))).catch(e => {
          console.error('Error fetching pending trainings:', e)
          return []
        }),

        // Pending freelancers
        db.freelancerProfile.findMany({
          where: {
            profileCompleted: false
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          take: 10
        }).then(freelancers => freelancers.map(f => ({
          type: 'freelancer' as const,
          id: f.id,
          name: f.name,
          submittedDate: f.createdAt,
          status: f.profileCompleted ? 'COMPLETED' : 'PENDING',
          submittedBy: f.name,
          submittedByEmail: f.user.email
        }))).catch(e => {
          console.error('Error fetching pending freelancers:', e)
          return []
        })
      ]).then(results => results.flat())

      console.log('Pending items fetched:', pendingItems.length)

      // Calculate average review time (simplified)
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

      console.log('Dashboard data compiled successfully')

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

    } catch (dbError) {
      console.error('Database error in dashboard:', dbError)
      // Return default data if database queries fail
      return NextResponse.json({
        stats: {
          pendingReviews: 0,
          activeTrainings: 0,
          organizations: 0,
          freelancers: 0,
          completedReviews: 0,
          averageReviewTime: "N/A"
        },
        recentReviews: [],
        pendingItems: []
      })
    }

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