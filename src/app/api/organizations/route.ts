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