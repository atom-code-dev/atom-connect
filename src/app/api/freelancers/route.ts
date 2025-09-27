import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TrainerType, AvailabilityStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
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
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          skills: {
            hasSome: [search]
          }
        },
        {
          experience: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    if (trainerType) {
      where.trainerType = trainerType as TrainerType
    }

    if (availability) {
      where.availability = availability as AvailabilityStatus
    }

    const [freelancers, total] = await Promise.all([
      db.freelancerProfile.findMany({
        where,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.freelancerProfile.count({ where })
    ])

    return NextResponse.json({
      freelancers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
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