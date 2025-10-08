import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TrainerType, AvailabilityStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const trainerType = searchParams.get('trainerType') || ''
    const availability = searchParams.get('availability') || ''

    const skip = (page - 1) * limit

    const where: any = {
      // Only add search filters if search term is provided
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const
            }
          },
          {
            experience: {
              contains: search,
              mode: 'insensitive' as const
            }
          }
        ]
      })
    }

    if (trainerType && trainerType !== 'ALL') {
      where.trainerType = trainerType as TrainerType
    }

    if (availability && availability !== 'ALL') {
      where.availability = availability as AvailabilityStatus
    }

    try {
      const [freelancers, total] = await Promise.all([
        db.freelancerProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            trainings: {
              select: {
                id: true,
                title: true,
                startDate: true,
                endDate: true
              }
            },
            feedbacks: {
              select: {
                id: true,
                overallRating: true,
                createdAt: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        db.freelancerProfile.count({ where })
      ])

      // Calculate rating for each freelancer
      const freelancersWithRating = freelancers.map(freelancer => {
        const feedbacks = freelancer.feedbacks || []
        const avgRating = feedbacks.length > 0 
          ? feedbacks.reduce((sum, f) => sum + (f.overallRating || 0), 0) / feedbacks.length 
          : 0
        
        // Parse skills if it's a string
        let skills: any[] = []
        try {
          if (freelancer.skills && typeof freelancer.skills === 'string') {
            skills = JSON.parse(freelancer.skills)
          } else if (Array.isArray(freelancer.skills)) {
            skills = freelancer.skills
          }
        } catch (e) {
          console.error('Error parsing skills:', e)
          skills = []
        }
        
        return {
          id: freelancer.id,
          name: freelancer.name,
          email: freelancer.email,
          phone: freelancer.phone,
          skills: skills,
          trainerType: freelancer.trainerType,
          experience: freelancer.experience,
          linkedinProfile: freelancer.linkedinProfile,
          availability: freelancer.availability,
          location: freelancer.location,
          rating: Math.round(avgRating * 10) / 10,
          completedTrainings: freelancer.trainings?.length || 0,
          profileCompleted: freelancer.profileCompleted,
          createdAt: freelancer.createdAt,
          user: {
            name: freelancer.user?.name,
            email: freelancer.user?.email
          }
        }
      })

      return NextResponse.json({
        freelancers: freelancersWithRating,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    } catch (dbError) {
      console.error('Database error in freelancers API:', dbError)
      return NextResponse.json({
        freelancers: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0
        }
      })
    }
  } catch (error) {
    console.error('Error fetching freelancers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'FREELANCER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      skills,
      trainerType,
      experience,
      linkedinProfile,
      cv,
      profilePicture,
      activity,
      availability,
      location
    } = body

    // Get freelancer profile
    const freelancerProfile = await db.freelancerProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!freelancerProfile) {
      return NextResponse.json({ error: 'Freelancer profile not found' }, { status: 404 })
    }

    const updatedProfile = await db.freelancerProfile.update({
      where: { id: freelancerProfile.id },
      data: {
        name: name || freelancerProfile.name,
        phone: phone || freelancerProfile.phone,
        skills: skills || freelancerProfile.skills,
        trainerType: trainerType ? trainerType as TrainerType : freelancerProfile.trainerType,
        experience: experience || freelancerProfile.experience,
        linkedinProfile: linkedinProfile || freelancerProfile.linkedinProfile,
        cv: cv || freelancerProfile.cv,
        profilePicture: profilePicture || freelancerProfile.profilePicture,
        activity: activity || freelancerProfile.activity,
        availability: availability ? availability as AvailabilityStatus : freelancerProfile.availability,
        location: location || freelancerProfile.location,
      },
      include: {
        user: true,
        trainings: {
          include: {
            category: true,
            organization: {
              include: {
                user: true
              }
            }
          }
        },
        feedbacks: {
          include: {
            training: true,
            organization: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating freelancer profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'MAINTAINER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { freelancerIds, action } = body

    if (!freelancerIds || !Array.isArray(freelancerIds) || freelancerIds.length === 0) {
      return NextResponse.json({ error: 'Invalid freelancer IDs' }, { status: 400 })
    }

    const validActions = ['activate', 'deactivate', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    switch (action) {
      case 'activate':
        await db.freelancerProfile.updateMany({
          where: { id: { in: freelancerIds } },
          data: { availability: 'AVAILABLE' }
        })
        break

      case 'deactivate':
        await db.freelancerProfile.updateMany({
          where: { id: { in: freelancerIds } },
          data: { availability: 'NOT_AVAILABLE' }
        })
        break

      case 'delete':
        // Delete feedbacks first (due to foreign key constraints)
        await db.trainingFeedback.deleteMany({
          where: { freelancerId: { in: freelancerIds } }
        })
        
        // Update trainings to remove freelancer assignment
        await db.training.updateMany({
          where: { freelancerId: { in: freelancerIds } },
          data: { freelancerId: null }
        })
        
        // Delete freelancer profiles
        await db.freelancerProfile.deleteMany({
          where: { id: { in: freelancerIds } }
        })
        
        // Delete users
        const freelancersToDelete = await db.freelancerProfile.findMany({
          where: { id: { in: freelancerIds } },
          select: { userId: true }
        })
        
        await db.user.deleteMany({
          where: { id: { in: freelancersToDelete.map(freelancer => freelancer.userId) } }
        })
        break
    }

    return NextResponse.json({ success: true, message: `${action} action completed` })
  } catch (error) {
    console.error('Error performing bulk action on freelancers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Freelancer ID is required' }, { status: 400 })
    }

    // Delete feedbacks first (due to foreign key constraints)
    await db.trainingFeedback.deleteMany({
      where: { freelancerId: id }
    })

    // Update trainings to remove freelancer assignment
    await db.training.updateMany({
      where: { freelancerId: id },
      data: { freelancerId: null }
    })

    // Get freelancer profile to delete user
    const freelancerProfile = await db.freelancerProfile.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (freelancerProfile) {
      // Delete freelancer profile
      await db.freelancerProfile.delete({
        where: { id }
      })

      // Delete user
      await db.user.delete({
        where: { id: freelancerProfile.userId }
      })
    }

    return NextResponse.json({ success: true, message: 'Freelancer deleted successfully' })
  } catch (error) {
    console.error('Error deleting freelancer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}