import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TrainingType, TrainerType, AvailabilityStatus } from '@prisma/client'

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
    const category = searchParams.get('category') || ''
    const type = searchParams.get('type') || ''

    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        {
          title: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    if (category) {
      where.category = {
        name: {
          contains: category,
          mode: 'insensitive' as const
        }
      }
    }

    if (type) {
      where.type = type as TrainingType
    }

    const [trainings, total] = await Promise.all([
      db.training.findMany({
        where,
        include: {
          category: true,
          location: true,
          stack: true,
          organization: {
            include: {
              user: true
            }
          },
          freelancer: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.training.count({ where })
    ])

    return NextResponse.json({
      trainings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching trainings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      skills,
      categoryId,
      type,
      locationId,
      stackId,
      companyName,
      startDate,
      endDate,
      paymentTerm,
      paymentAmount
    } = body

    if (!title || !description || !categoryId || !type || !locationId || !stackId || !companyName || !startDate || !endDate || !paymentTerm || !paymentAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get organization profile
    const organizationProfile = await db.organizationProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!organizationProfile) {
      return NextResponse.json({ error: 'Organization profile not found' }, { status: 404 })
    }

    const training = await db.training.create({
      data: {
        title,
        description,
        skills: skills || [],
        categoryId,
        type: type as TrainingType,
        locationId,
        stackId,
        companyName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        paymentTerm: parseInt(paymentTerm),
        paymentAmount: parseFloat(paymentAmount),
        organizationId: organizationProfile.id,
      },
      include: {
        category: true,
        location: true,
        stack: true,
        organization: {
          include: {
            user: true
          }
        },
        freelancer: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json(training, { status: 201 })
  } catch (error) {
    console.error('Error creating training:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}