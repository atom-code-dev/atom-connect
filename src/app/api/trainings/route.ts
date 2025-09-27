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

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'MAINTAINER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { trainingIds, action } = body

    if (!trainingIds || !Array.isArray(trainingIds) || trainingIds.length === 0) {
      return NextResponse.json({ error: 'Invalid training IDs' }, { status: 400 })
    }

    const validActions = ['activate', 'deactivate', 'publish', 'unpublish', 'delete', 'approve', 'reject']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    switch (action) {
      case 'activate':
        await db.training.updateMany({
          where: { id: { in: trainingIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        await db.training.updateMany({
          where: { id: { in: trainingIds } },
          data: { isActive: false }
        })
        break

      case 'publish':
        await db.training.updateMany({
          where: { id: { in: trainingIds } },
          data: { isPublished: true }
        })
        break

      case 'unpublish':
        await db.training.updateMany({
          where: { id: { in: trainingIds } },
          data: { isPublished: false }
        })
        break

      case 'delete':
        // Delete feedbacks first (due to foreign key constraints)
        await db.trainingFeedback.deleteMany({
          where: { trainingId: { in: trainingIds } }
        })
        
        // Delete trainings
        await db.training.deleteMany({
          where: { id: { in: trainingIds } }
        })
        break

      case 'approve':
      case 'reject':
        // For maintainer approval/rejection, we would need to add a status field to Training model
        // For now, we'll just update the published status
        const publishStatus = action === 'approve'
        await db.training.updateMany({
          where: { id: { in: trainingIds } },
          data: { isPublished: publishStatus }
        })
        break
    }

    return NextResponse.json({ success: true, message: `${action} action completed` })
  } catch (error) {
    console.error('Error performing bulk action on trainings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'ORGANIZATION'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Training ID is required' }, { status: 400 })
    }

    // Check if user owns the training (for organizations) or is admin
    if (session.user.role === 'ORGANIZATION') {
      const training = await db.training.findUnique({
        where: { id },
        include: { organization: true }
      })

      if (!training || training.organization.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Delete feedbacks first (due to foreign key constraints)
    await db.trainingFeedback.deleteMany({
      where: { trainingId: id }
    })

    // Delete training
    await db.training.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Training deleted successfully' })
  } catch (error) {
    console.error('Error deleting training:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}