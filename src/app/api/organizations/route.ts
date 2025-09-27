import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { VerificationStatus, ActiveStatus } from '@prisma/client'

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
    const verificationStatus = searchParams.get('verificationStatus') || ''
    const activeStatus = searchParams.get('activeStatus') || ''

    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        {
          organizationName: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          website: {
            contains: search,
            mode: 'insensitive' as const
          }
        },
        {
          companyLocation: {
            contains: search,
            mode: 'insensitive' as const
          }
        }
      ]
    }

    if (verificationStatus) {
      where.verifiedStatus = verificationStatus as VerificationStatus
    }

    if (activeStatus) {
      where.activeStatus = activeStatus as ActiveStatus
    }

    const [organizations, total] = await Promise.all([
      db.organizationProfile.findMany({
        where,
        include: {
          user: true,
          trainings: {
            include: {
              category: true,
              freelancer: {
                include: {
                  user: true
                }
              }
            }
          },
          feedbacks: {
            include: {
              training: true,
              freelancer: {
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
      db.organizationProfile.count({ where })
    ])

    return NextResponse.json({
      organizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      organizationName,
      website,
      contactMail,
      phone,
      companyLocation,
      logo
    } = body

    // Get organization profile
    const organizationProfile = await db.organizationProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!organizationProfile) {
      return NextResponse.json({ error: 'Organization profile not found' }, { status: 404 })
    }

    const updatedProfile = await db.organizationProfile.update({
      where: { id: organizationProfile.id },
      data: {
        organizationName: organizationName || organizationProfile.organizationName,
        website: website || organizationProfile.website,
        contactMail: contactMail || organizationProfile.contactMail,
        phone: phone || organizationProfile.phone,
        companyLocation: companyLocation || organizationProfile.companyLocation,
        logo: logo || organizationProfile.logo,
      },
      include: {
        user: true,
        trainings: {
          include: {
            category: true,
            freelancer: {
              include: {
                user: true
              }
            }
          }
        },
        feedbacks: {
          include: {
            training: true,
            freelancer: {
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
    console.error('Error updating organization profile:', error)
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
    const { organizationIds, action } = body

    if (!organizationIds || !Array.isArray(organizationIds) || organizationIds.length === 0) {
      return NextResponse.json({ error: 'Invalid organization IDs' }, { status: 400 })
    }

    const validActions = ['activate', 'deactivate', 'verify', 'unverify', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    switch (action) {
      case 'activate':
        await db.organizationProfile.updateMany({
          where: { id: { in: organizationIds } },
          data: { activeStatus: 'ACTIVE' }
        })
        break

      case 'deactivate':
        await db.organizationProfile.updateMany({
          where: { id: { in: organizationIds } },
          data: { activeStatus: 'INACTIVE' }
        })
        break

      case 'verify':
        await db.organizationProfile.updateMany({
          where: { id: { in: organizationIds } },
          data: { verifiedStatus: 'VERIFIED' }
        })
        break

      case 'unverify':
        await db.organizationProfile.updateMany({
          where: { id: { in: organizationIds } },
          data: { verifiedStatus: 'PENDING' }
        })
        break

      case 'delete':
        // Delete feedbacks first (due to foreign key constraints)
        await db.trainingFeedback.deleteMany({
          where: { organizationId: { in: organizationIds } }
        })
        
        // Delete trainings
        await db.training.deleteMany({
          where: { organizationId: { in: organizationIds } }
        })
        
        // Delete organization profiles
        await db.organizationProfile.deleteMany({
          where: { id: { in: organizationIds } }
        })
        
        // Delete users
        const organizationsToDelete = await db.organizationProfile.findMany({
          where: { id: { in: organizationIds } },
          select: { userId: true }
        })
        
        await db.user.deleteMany({
          where: { id: { in: organizationsToDelete.map(org => org.userId) } }
        })
        break
    }

    return NextResponse.json({ success: true, message: `${action} action completed` })
  } catch (error) {
    console.error('Error performing bulk action on organizations:', error)
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
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Delete feedbacks first (due to foreign key constraints)
    await db.trainingFeedback.deleteMany({
      where: { organizationId: id }
    })

    // Delete trainings
    await db.training.deleteMany({
      where: { organizationId: id }
    })

    // Get organization profile to delete user
    const organizationProfile = await db.organizationProfile.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (organizationProfile) {
      // Delete organization profile
      await db.organizationProfile.delete({
        where: { id }
      })

      // Delete user
      await db.user.delete({
        where: { id: organizationProfile.userId }
      })
    }

    return NextResponse.json({ success: true, message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}